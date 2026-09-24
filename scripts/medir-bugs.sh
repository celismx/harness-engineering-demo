#!/usr/bin/env bash
# Corre N veces el mismo prompt de búsqueda de bugs con Haiku, con harness (rama main)
# y sin harness (rama sin-harness), y deja reportes + CSV en resultados/<fecha>/.
#
# Aislamiento: Claude Code carga ~/.claude/CLAUDE.md por HOME y también al recorrer los
# directorios padre del repo, y resuelve la config del proyecto por la raíz de git (un
# worktree hereda la .claude/ del repo principal). Cada corrida usa una copia exportada con
# git archive, fuera de $HOME, con su propio git, y un HOME limpio que solo enlaza el login.
set -euo pipefail

N=${N:-3}
MODELO=${MODELO:-haiku}
CONDICIONES=${CONDICIONES:-con-harness sin-harness}
BASE=${BASE:-/tmp/monedero-medicion}
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
RES="$REPO/resultados/$(date +%Y%m%d-%H%M%S)"
# Misma base de herramientas genéricas para ambas condiciones; las reglas deny del harness ganan.
HERRAMIENTAS='Bash(curl *),Bash(node *),Bash(npm *),Bash(npx *),Bash(ls *),Bash(cat *)'
PROMPT='Revisa la app Monedero en staging (http://localhost:3000) y reporta todos los bugs que encuentres. Escribe el reporte en qa/reports/exploracion.md.'

# Los shims de asdf/nvm dependen de HOME; se usa el binario real de Node.
NODE_BIN=$(dirname "$(node -p process.execPath)")

mkdir -p "$RES" "$BASE/home/.claude"
ln -sf "$HOME/.claude/.credentials.json" "$BASE/home/.claude/.credentials.json"
echo "condicion,corrida,reloj_s,costo_usd,turnos,denegaciones,src_modificado,reporte" > "$RES/resultados.csv"

if curl -s -o /dev/null http://localhost:3000; then
  echo "El puerto 3000 está ocupado; detén la app antes de medir." >&2
  exit 1
fi

for condicion in $CONDICIONES; do
  rama=$([ "$condicion" = con-harness ] && echo main || echo sin-harness)
  for i in $(seq 1 "$N"); do
    dir="$BASE/$condicion-$i"
    rm -rf "$dir"
    mkdir -p "$dir"
    git -C "$REPO" archive "$rama" | tar -x -C "$dir"
    git -C "$dir" init -q && git -C "$dir" add -A && git -C "$dir" -c user.name=demo -c user.email=demo@local commit -qm base
    ln -s "$REPO/node_modules" "$dir/node_modules"
    # El subagente qa fija su modelo en el frontmatter; se alinea con el de la corrida.
    [ -f "$dir/.claude/agents/qa.md" ] && sed -i "s/^model: .*/model: $MODELO/" "$dir/.claude/agents/qa.md"
    node -e '
      const fs = require("fs");
      const [archivo, dir] = process.argv.slice(1);
      let c = {};
      try { c = JSON.parse(fs.readFileSync(archivo, "utf8")); } catch {}
      c.projects = { ...c.projects, [dir]: { hasTrustDialogAccepted: true } };
      fs.writeFileSync(archivo, JSON.stringify(c));
    ' "$BASE/home/.claude.json" "$dir"

    (cd "$dir" && PORT=3000 node src/server.js > /dev/null 2>&1) &
    servidor=$!
    sleep 1

    echo "▶ $condicion #$i"
    inicio=$(date +%s)
    (cd "$dir" && env -i PATH="$NODE_BIN:$PATH" HOME="$BASE/home" TERM=xterm LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}" \
      timeout 900 claude -p "$PROMPT" --model "$MODELO" --output-format json \
      --permission-prompts none --permission-mode acceptEdits --allowedTools "$HERRAMIENTAS") > "$RES/$condicion-$i.json" 2> "$RES/$condicion-$i.err" || true

    reloj=$(( $(date +%s) - inicio ))
    pkill -P "$servidor" 2> /dev/null || true
    kill "$servidor" 2> /dev/null || true

    reporte=no
    if [ -f "$dir/qa/reports/exploracion.md" ]; then
      cp "$dir/qa/reports/exploracion.md" "$RES/$condicion-$i.md"
      reporte=si
    fi
    mkdir -p "$RES/$condicion-$i-evidencia"
    cp -r "$dir/qa/evidence/." "$RES/$condicion-$i-evidencia/" 2> /dev/null || true
    src_modificado=$([ -n "$(git -C "$dir" status --porcelain src)" ] && echo si || echo no)

    node -e '
      const fs = require("fs");
      let r = {};
      try { r = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); } catch {}
      const fila = [
        process.argv[2], process.argv[3],
        process.argv[6],
        (r.total_cost_usd ?? 0).toFixed(3),
        r.num_turns ?? "",
        (r.permission_denials ?? []).length,
        process.argv[4], process.argv[5],
      ];
      console.log(fila.join(","));
    ' "$RES/$condicion-$i.json" "$condicion" "$i" "$src_modificado" "$reporte" "$reloj" | tee -a "$RES/resultados.csv"

    git -C "$dir" diff --stat > "$RES/$condicion-$i.diff" || true
  done
done

echo
column -s, -t < "$RES/resultados.csv"
echo "Resultados en $RES"
