#!/usr/bin/env bash
# Corre N veces el mismo prompt de búsqueda de bugs con Haiku, con harness (rama main)
# y sin harness (rama sin-harness), y deja reportes + CSV en resultados/<fecha>/.
#
# Aislamiento: Claude Code carga ~/.claude/CLAUDE.md por HOME y también al recorrer los
# directorios padre del repo. Cada corrida usa un worktree fuera de $HOME y un HOME limpio
# que solo enlaza las credenciales de login.
set -euo pipefail

N=${N:-3}
MODELO=${MODELO:-haiku}
BASE=${BASE:-/tmp/monedero-medicion}
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
RES="$REPO/resultados/$(date +%Y%m%d-%H%M%S)"
PROMPT='Revisa la app Monedero en staging (http://localhost:3000) y reporta todos los bugs que encuentres. Escribe el reporte en qa/reports/exploracion.md.'

mkdir -p "$RES" "$BASE/home/.claude"
ln -sf "$HOME/.claude/.credentials.json" "$BASE/home/.claude/.credentials.json"
echo "condicion,corrida,duracion_s,costo_usd,turnos,denegaciones,src_modificado,reporte" > "$RES/resultados.csv"

if curl -s -o /dev/null http://localhost:3000; then
  echo "El puerto 3000 está ocupado; detén la app antes de medir." >&2
  exit 1
fi

for condicion in con-harness sin-harness; do
  rama=$([ "$condicion" = con-harness ] && echo main || echo sin-harness)
  for i in $(seq 1 "$N"); do
    dir="$BASE/$condicion-$i"
    rm -rf "$dir"
    git -C "$REPO" worktree prune
    git -C "$REPO" worktree add -q --detach "$dir" "$rama"
    ln -s "$REPO/node_modules" "$dir/node_modules"

    (cd "$dir" && PORT=3000 node src/server.js > /dev/null 2>&1) &
    servidor=$!
    sleep 1

    echo "▶ $condicion #$i"
    (cd "$dir" && env -i PATH="$PATH" HOME="$BASE/home" TERM=xterm LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}" \
      timeout 900 claude -p "$PROMPT" --model "$MODELO" --output-format json \
      --permission-prompts none --permission-mode acceptEdits) > "$RES/$condicion-$i.json" 2> "$RES/$condicion-$i.err" || true

    pkill -P "$servidor" 2> /dev/null || true
    kill "$servidor" 2> /dev/null || true
    pkill -f "node src/server.js" 2> /dev/null || true

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
        Math.round((r.duration_ms ?? 0) / 1000),
        (r.total_cost_usd ?? 0).toFixed(3),
        r.num_turns ?? "",
        (r.permission_denials ?? []).length,
        process.argv[4], process.argv[5],
      ];
      console.log(fila.join(","));
    ' "$RES/$condicion-$i.json" "$condicion" "$i" "$src_modificado" "$reporte" | tee -a "$RES/resultados.csv"

    git -C "$REPO" worktree remove --force "$dir"
  done
done

echo
column -s, -t < "$RES/resultados.csv"
echo "Resultados en $RES"
