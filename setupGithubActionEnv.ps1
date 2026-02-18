# Usage: .\setupGithubActionEnv.ps1 -EnvFile ".env.production" -Repo "salimkhr/cours-iut-web"

param(
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ".env.production",

    [Parameter(Mandatory=$false)]
    [string]$Repo = "salimkhr/cours-iut-web"
)

function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

$secretsToSync = @(
    "MONGODB_URI",
    "NEXT_PUBLIC_TURNSTILE_TOKEN",
    "TURNSTILE_SECRET_KEY",
    "NEXT_PUBLIC_GIT_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET"
)

$secretMapping = @{
    "GITHUB_TOKEN" = "GH_PAT"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   GitHub Secrets Sync Script" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

try {
    $ghVersion = gh --version 2>&1
    Write-Info "GitHub CLI detecte: $($ghVersion[0])"
} catch {
    Write-Err "GitHub CLI (gh) n'est pas installe!"
    Write-Host "Installez-le avec: winget install GitHub.cli" -ForegroundColor Yellow
    exit 1
}

$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Vous n'etes pas connecte a GitHub CLI!"
    Write-Host "Executez: gh auth login" -ForegroundColor Yellow
    exit 1
}
Write-Success "Authentifie sur GitHub"

if (-not (Test-Path $EnvFile)) {
    Write-Err "Fichier .env.production non trouve: $EnvFile"
    Write-Host "Creez un fichier .env.production avec vos variables ou specifiez le chemin avec -EnvFile" -ForegroundColor Yellow
    exit 1
}
Write-Success "Fichier .env.production trouve: $EnvFile"

Write-Info "Lecture du fichier .env..."
$envVars = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            $value = $value -replace '^["'']|["'']$', ''
            $envVars[$key] = $value
        }
    }
}

Write-Info "Variables trouvees dans .env: $($envVars.Count)"
Write-Host ""

$added = 0
$skipped = 0
$errors = 0

Write-Host "Synchronisation des secrets vers: $Repo" -ForegroundColor Cyan
Write-Host "----------------------------------------"

foreach ($secretName in $secretsToSync) {
    $envKey = $secretName
    $ghSecretName = $secretName

    if ($secretMapping.ContainsKey($secretName)) {
        $ghSecretName = $secretMapping[$secretName]
    }

    if ($envVars.ContainsKey($envKey)) {
        $value = $envVars[$envKey]
        if ($value) {
            try {
                $value | gh secret set $ghSecretName --repo $Repo 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "$ghSecretName"
                    $added++
                } else {
                    Write-Err "$ghSecretName - Erreur lors de l'ajout"
                    $errors++
                }
            } catch {
                Write-Err "$ghSecretName - $($_.Exception.Message)"
                $errors++
            }
        } else {
            Write-Warn "$ghSecretName - Valeur vide, ignore"
            $skipped++
        }
    } else {
        Write-Warn "$ghSecretName - Non trouve dans .env"
        $skipped++
    }
}

if ($envVars.ContainsKey("GITHUB_TOKEN") -and $envVars["GITHUB_TOKEN"]) {
    try {
        $envVars["GITHUB_TOKEN"] | gh secret set "GH_PAT" --repo $Repo 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "GH_PAT (depuis GITHUB_TOKEN)"
            $added++
        }
    } catch {
        Write-Err "GH_PAT - $($_.Exception.Message)"
        $errors++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   Resume" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  [OK] Ajoutes:  $added" -ForegroundColor Green
Write-Host "  [!]  Ignores:  $skipped" -ForegroundColor Yellow
Write-Host "  [X]  Erreurs:  $errors" -ForegroundColor Red
Write-Host ""

if ($errors -eq 0 -and $added -gt 0) {
    Write-Success "Secrets synchronises avec succes!"
} elseif ($errors -gt 0) {
    Write-Warn "Certains secrets n'ont pas pu etre ajoutes."
    Write-Host "Verifiez vos permissions sur le repo: $Repo" -ForegroundColor Yellow
}
