{{- define "kuma.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "kuma.labels" -}}
helm.sh/chart: {{ include "kuma.chart" . }}
{{ include "kuma.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "kuma.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.kuma.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
