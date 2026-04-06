$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$inputPath = Join-Path $projectRoot "PROJECT_SUBMISSION_REPORT.md"
$pdfPath = Join-Path $projectRoot "PROJECT_SUBMISSION_REPORT.pdf"

if (-not (Test-Path $inputPath)) {
  throw "Input report not found: $inputPath"
}

$lines = Get-Content $inputPath
$word = $null
$document = $null
$selection = $null

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Add()
  $selection = $word.Selection

  foreach ($line in $lines) {
    $trimmed = $line.Trim()

    if ($trimmed -eq "") {
      $selection.TypeParagraph()
      continue
    }

    if ($trimmed -eq "---") {
      $selection.TypeText("____________________________________________________________")
      $selection.TypeParagraph()
      $selection.TypeParagraph()
      continue
    }

    if ($trimmed.StartsWith("# ")) {
      $selection.Style = "Heading 1"
      $selection.TypeText($trimmed.Substring(2))
      $selection.TypeParagraph()
      continue
    }

    if ($trimmed.StartsWith("## ")) {
      $selection.Style = "Heading 2"
      $selection.TypeText($trimmed.Substring(3))
      $selection.TypeParagraph()
      continue
    }

    if ($trimmed.StartsWith("### ")) {
      $selection.Style = "Heading 3"
      $selection.TypeText($trimmed.Substring(4))
      $selection.TypeParagraph()
      continue
    }

    $selection.Style = "Normal"

    if ($trimmed.StartsWith("- ")) {
      $selection.TypeText([char]0x2022 + " " + $trimmed.Substring(2))
      $selection.TypeParagraph()
      continue
    }

    $selection.TypeText($trimmed)
    $selection.TypeParagraph()
  }

  $document.ExportAsFixedFormat($pdfPath, 17)
}
finally {
  if ($document -ne $null) {
    $document.Close()
  }

  if ($word -ne $null) {
    $word.Quit()
  }
}

Write-Output "Generated PDF: $pdfPath"
