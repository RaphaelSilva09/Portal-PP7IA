#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$REPO_ROOT/frontend"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m';  GREEN='\033[0;32m';  YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m';   BOLD='\033[1m'
DIM='\033[2m';     NC='\033[0m'
TICK='✓'; CROSS='✗'; WARN='⚠'

# ── State ─────────────────────────────────────────────────────────────────────
UNIT_EXIT=0; E2E_EXIT=0; E2E_SKIP=0; DOCKER_READY=0
UNIT_TIME=0; E2E_TIME=0
START_TIME=$(date +%s)
TMP_LOG=$(mktemp)
trap 'rm -f "$TMP_LOG"' EXIT

# ── OS Detection ──────────────────────────────────────────────────────────────
OS_TYPE="$(uname -s 2>/dev/null || echo Unknown)"
case "$OS_TYPE" in
    Darwin)            OS_LABEL="macOS"   ;;
    Linux)             OS_LABEL="Linux"   ;;
    MINGW*|CYGWIN*|MSYS*) OS_LABEL="Windows" ;;
    *)                 OS_LABEL="$OS_TYPE" ;;
esac

# ── Helpers ───────────────────────────────────────────────────────────────────
hr_heavy() { echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }
hr_light() { echo -e "  ${DIM}───────────────────────────────────────────────────────${NC}"; }
ok()       { echo -e "    ${GREEN}${TICK}${NC}  $1"; }
warn_msg() { echo -e "    ${YELLOW}${WARN}${NC}  $1"; }
fail_msg() { echo -e "    ${RED}${CROSS}${NC}  $1"; }

fmt_time() {
    local t=$1
    if (( t < 60 )); then printf '%ds' "$t"
    else printf '%dm%02ds' $(( t / 60 )) $(( t % 60 ))
    fi
}

progress() {
    local done=$1 total=3 width=44
    local filled=$(( done * width / total ))
    local empty=$(( width - filled ))
    local pct=$(( done * 100 / total ))
    local bar='' i
    for (( i=0; i<filled; i++ )); do bar+='█'; done
    for (( i=0; i<empty;  i++ )); do bar+='░'; done
    printf "\n  ${DIM}[${NC}${CYAN}%s${NC}${DIM}]${NC}  ${BOLD}%3d%%${NC}\n" "$bar" "$pct"
}

step_header() {
    progress "$1"
    echo ""
    echo -e "  ${BLUE}${BOLD}[$2/3]${NC}  ${BOLD}$3${NC}"
    hr_light
    echo ""
}

# ── Spinner (captura output, mostra animação) ─────────────────────────────────
spinner_run() {
    local msg="$1"; shift
    local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
    local i=0
    "$@" >"$TMP_LOG" 2>&1 &
    local pid=$!
    while kill -0 "$pid" 2>/dev/null; do
        printf "\r    ${CYAN}%s${NC}  ${DIM}%s${NC}" "${frames[$((i % 10))]}" "$msg"
        sleep 0.08
        i=$(( i + 1 ))
    done
    printf "\r\033[K"
    wait "$pid"
}

show_log_tail() {
    [ -s "$TMP_LOG" ] || return 0
    echo ""
    grep -v '^[[:space:]]*$' "$TMP_LOG" | head -6 | sed 's/^/      /'
    echo ""
}

# ── Docker: detecta e tenta iniciar conforme o OS ────────────────────────────
ensure_docker() {
    if docker info >/dev/null 2>&1; then
        ok "Docker disponível"
        DOCKER_READY=1; return 0
    fi

    local t0=$(date +%s)

    case "$OS_TYPE" in
        Darwin)
            # 1. colima — Docker CLI sem Docker Desktop (uso mais comum no macOS)
            if command -v colima >/dev/null 2>&1; then
                warn_msg "Iniciando Docker via colima..."
                if spinner_run "colima start..." colima start; then
                    ok "Docker pronto via colima  ${DIM}($(fmt_time $(( $(date +%s) - t0 ))))${NC}"
                    DOCKER_READY=1; return 0
                else
                    fail_msg "colima start falhou"; show_log_tail; return 1
                fi
            fi
            # 2. OrbStack
            if [ -d "/Applications/OrbStack.app" ]; then
                warn_msg "Iniciando OrbStack..."
                open -a OrbStack 2>/dev/null || true
                local w=0
                while (( w < 30 )); do
                    if docker info >/dev/null 2>&1; then
                        ok "Docker pronto via OrbStack  ${DIM}($(fmt_time $(( $(date +%s) - t0 ))))${NC}"
                        DOCKER_READY=1; return 0
                    fi
                    sleep 1; w=$(( w + 1 ))
                done
                fail_msg "OrbStack não respondeu a tempo"; return 1
            fi
            # 3. Docker Desktop
            if [ -d "/Applications/Docker.app" ]; then
                warn_msg "Iniciando Docker Desktop..."
                open -a Docker 2>/dev/null || true
                local w=0
                while (( w < 60 )); do
                    if docker info >/dev/null 2>&1; then
                        ok "Docker pronto via Docker Desktop  ${DIM}($(fmt_time $(( $(date +%s) - t0 ))))${NC}"
                        DOCKER_READY=1; return 0
                    fi
                    sleep 1; w=$(( w + 1 ))
                done
                fail_msg "Docker Desktop não respondeu a tempo"; return 1
            fi
            fail_msg "Docker não encontrado — instale colima (brew install colima) ou OrbStack"
            ;;
        Linux)
            if command -v systemctl >/dev/null 2>&1; then
                warn_msg "Iniciando Docker daemon via systemctl..."
                if spinner_run "sudo systemctl start docker..." sudo systemctl start docker; then
                    ok "Docker pronto  ${DIM}($(fmt_time $(( $(date +%s) - t0 ))))${NC}"
                    DOCKER_READY=1; return 0
                else
                    fail_msg "systemctl start docker falhou"; show_log_tail; return 1
                fi
            elif command -v service >/dev/null 2>&1; then
                warn_msg "Iniciando Docker daemon via service..."
                if spinner_run "sudo service docker start..." sudo service docker start; then
                    ok "Docker pronto  ${DIM}($(fmt_time $(( $(date +%s) - t0 ))))${NC}"
                    DOCKER_READY=1; return 0
                else
                    fail_msg "service docker start falhou"; show_log_tail; return 1
                fi
            fi
            fail_msg "Docker não encontrado no Linux — verifique a instalação"
            ;;
        *)
            fail_msg "OS não suportado para auto-start do Docker: ${OS_LABEL}"
            ;;
    esac

    return 1
}

# ── HEADER ───────────────────────────────────────────────────────────────────
echo ""
hr_heavy
echo -e "  ${BOLD}PP7IA — Suite Completa de Testes${NC}  ${DIM}${OS_LABEL}${NC}"
hr_heavy

# ── [1/3] DOCKER + SUPABASE ───────────────────────────────────────────────────
step_header 0 1 "Docker + Supabase Local"

ensure_docker || true

if [ "$DOCKER_READY" -eq 1 ]; then
    if curl -s --max-time 2 "http://127.0.0.1:54321/rest/v1/" -o /dev/null 2>/dev/null; then
        ok "Supabase já está rodando  ${DIM}(127.0.0.1:54321)${NC}"
    else
        warn_msg "Iniciando Supabase local..."
        t_sb=$(date +%s)
        if spinner_run "supabase start..." bash -c "cd '$REPO_ROOT' && supabase start"; then
            ok "Supabase iniciado  ${DIM}($(fmt_time $(( $(date +%s) - t_sb ))))${NC}"
        else
            fail_msg "supabase start falhou — testes E2E serão pulados"
            show_log_tail
            E2E_SKIP=1
        fi
    fi
else
    warn_msg "Docker indisponível — testes E2E serão pulados"
    E2E_SKIP=1
fi

# ── [2/3] UNIT TESTS ──────────────────────────────────────────────────────────
step_header 1 2 "Testes Unitários  (Vitest)"
cd "$FRONTEND_DIR"
t_unit=$(date +%s)
if pnpm test; then UNIT_EXIT=0; else UNIT_EXIT=1; fi
UNIT_TIME=$(( $(date +%s) - t_unit ))
echo ""
if [ "$UNIT_EXIT" -eq 0 ]; then
    ok "Concluído  ${DIM}($(fmt_time $UNIT_TIME))${NC}"
else
    fail_msg "Falhou  ${DIM}($(fmt_time $UNIT_TIME))${NC}"
fi

# ── [3/3] E2E TESTS ───────────────────────────────────────────────────────────
step_header 2 3 "Testes E2E  (Playwright + Supabase local)"
t_e2e=$(date +%s)
if [ "$E2E_SKIP" -eq 1 ]; then
    warn_msg "Pulando — Docker/Supabase não disponível  ${DIM}(inicie o Docker e tente novamente)${NC}"
    E2E_TIME=0
elif pnpm test:e2e:local; then
    E2E_EXIT=0
    E2E_TIME=$(( $(date +%s) - t_e2e ))
else
    E2E_EXIT=1
    E2E_TIME=$(( $(date +%s) - t_e2e ))
fi
echo ""
if [ "$E2E_SKIP" -eq 0 ]; then
    if [ "$E2E_EXIT" -eq 0 ]; then
        ok "Concluído  ${DIM}($(fmt_time $E2E_TIME))${NC}"
    else
        fail_msg "Falhou  ${DIM}($(fmt_time $E2E_TIME))${NC}"
    fi
fi

# ── SUMMARY ───────────────────────────────────────────────────────────────────
progress 3
TOTAL_TIME=$(( $(date +%s) - START_TIME ))
echo ""
hr_heavy
echo -e "  ${BOLD}Resumo Final${NC}  ${DIM}$(fmt_time $TOTAL_TIME) total${NC}"
hr_heavy

if [ "$DOCKER_READY" -eq 1 ]; then
    ok "Docker + Supabase    —  pronto"
else
    warn_msg "Docker + Supabase    —  indisponível"
fi

if [ "$UNIT_EXIT" -eq 0 ]; then
    ok "Testes Unitários     —  ${GREEN}PASSOU${NC}   ${DIM}($(fmt_time $UNIT_TIME))${NC}"
else
    fail_msg "Testes Unitários     —  ${RED}FALHOU${NC}   ${DIM}($(fmt_time $UNIT_TIME))${NC}"
fi

if [ "$E2E_SKIP" -eq 1 ]; then
    echo -e "    ${YELLOW}${WARN}${NC}  Testes E2E           —  ${YELLOW}PULADO${NC}   ${DIM}(Docker indisponível)${NC}"
elif [ "$E2E_EXIT" -eq 0 ]; then
    ok "Testes E2E           —  ${GREEN}PASSOU${NC}   ${DIM}($(fmt_time $E2E_TIME))${NC}"
else
    fail_msg "Testes E2E           —  ${RED}FALHOU${NC}   ${DIM}($(fmt_time $E2E_TIME))${NC}"
fi

echo ""
hr_heavy
if [ "$UNIT_EXIT" -ne 0 ] || { [ "$E2E_SKIP" -eq 0 ] && [ "$E2E_EXIT" -ne 0 ]; }; then
    echo -e "  ${RED}${BOLD}${CROSS}  ALGUNS TESTES FALHARAM${NC}"
elif [ "$E2E_SKIP" -eq 1 ]; then
    echo -e "  ${YELLOW}${BOLD}${WARN}  TESTES UNITÁRIOS PASSARAM — E2E PULADOS${NC}"
else
    echo -e "  ${GREEN}${BOLD}${TICK}  TODOS OS TESTES PASSARAM${NC}"
fi
hr_heavy
echo ""

[ "$UNIT_EXIT" -eq 0 ] && [ "$E2E_EXIT" -eq 0 ]
