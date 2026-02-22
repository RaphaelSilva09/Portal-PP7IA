Write-Host "
================================================" -ForegroundColor Cyan
Write-Host "  Validacao Setup - Admin PP7+IAS" -ForegroundColor Cyan  
Write-Host "================================================
" -ForegroundColor Cyan

$errors = 0

Write-Host "1. Variaveis de ambiente..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $env = Get-Content ".env.local" -Raw
    if ($env -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-Host "   [OK] SERVICE_ROLE_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "   [ERRO] SERVICE_ROLE_KEY NAO configurada" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   [ERRO] .env.local nao existe" -ForegroundColor Red
    $errors++
}

Write-Host "
2. Migrations..." -ForegroundColor Yellow
$migs = @("007_especial_semana_table.sql","008_add_read_time_column.sql","009_seed_data_dev.sql","999_promote_user_to_admin.sql")
foreach ($m in $migs) {
    if (Test-Path "../supabase/migrations/$m") {
        Write-Host "   [OK] $m" -ForegroundColor Green
    } else {
        Write-Host "   [ERRO] $m nao encontrada" -ForegroundColor Red
        $errors++
    }
}

Write-Host "
3. Entidades..." -ForegroundColor Yellow
$ents = @("EspecialSemana.ts","User.ts")
foreach ($e in $ents) {
    if (Test-Path "domain/entities/$e") {
        Write-Host "   [OK] $e" -ForegroundColor Green
    } else {
        Write-Host "   [ERRO] $e nao encontrada" -ForegroundColor Red
        $errors++
    }
}

Write-Host "
4. Repositorios..." -ForegroundColor Yellow
$repos = @("SupabaseEspecialSemanaRepository.ts","SupabaseUserManagementRepository.ts","SupabaseAnalyticsRepository.ts")
foreach ($r in $repos) {
    if (Test-Path "infrastructure/repositories/$r") {
        Write-Host "   [OK] $r" -ForegroundColor Green
    } else {
        Write-Host "   [ERRO] $r nao encontrado" -ForegroundColor Red
        $errors++
    }
}

Write-Host "
5. API Routes..." -ForegroundColor Yellow
$apis = @("app/api/admin/users/promote/route.ts","app/api/admin/users/demote/route.ts","app/api/admin/users/[id]/route.ts")
foreach ($a in $apis) {
    if (Test-Path $a) {
        Write-Host "   [OK] $a" -ForegroundColor Green
    } else {
        Write-Host "   [ERRO] $a nao encontrada" -ForegroundColor Red
        $errors++
    }
}

Write-Host "
================================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "[SUCESSO] Todos componentes OK!" -ForegroundColor Green
    Write-Host "
Proximos passos:" -ForegroundColor Yellow
    Write-Host "1. Aplicar migrations 007, 008, 009" -ForegroundColor Gray
    Write-Host "2. Criar usuario teste" -ForegroundColor Gray
    Write-Host "3. Promover para admin (migration 999)" -ForegroundColor Gray
    Write-Host "4. Testar /admin" -ForegroundColor Gray
} else {
    Write-Host "[ERRO] $errors problema(s) encontrado(s)" -ForegroundColor Red
}
Write-Host "================================================
" -ForegroundColor Cyan
