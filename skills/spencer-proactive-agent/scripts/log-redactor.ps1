# Log Redactor — v2.0 Stealth Security
# Redacts secrets from log strings before writing

param(
    [string]$InputString
)

# Patterns to redact: API keys, Bearer tokens, Basic auth, GitHub PATs, generic sk_ live keys
# Plus privacy shield: WIP, DRAFT, CONFIDENTIAL, SECRET markers
$patterns = @(
    'Bearer\s+([A-Za-z0-9\-_]+)',
    'Basic\s+([A-Za-z0-9\-_=]+)',
    'ghp_[A-Za-z0-9]+',
    'sk_live_[A-Za-z0-9]+',
    'sk_test_[A-Za-z0-9]+',
    'xoxb-[A-Za-z0-9]+',
    '[\w\.-]+@[\w\.-]+:\w+',  # email:password pattern
    '\bWIP\b',
    '\bDRAFT\b',
    '\bCONFIDENTIAL\b',
    '\bSECRET\b'
)

$redacted = $InputString
foreach ($pat in $patterns) {
    $redacted = [regex]::Replace($redacted, $pat, '<REDACTED>')
}

return $redacted
