{{- define "atuin.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "atuin.labels" -}}
helm.sh/chart: {{ include "atuin.chart" . }}
{{ include "atuin.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "atuin.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.atuin.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
