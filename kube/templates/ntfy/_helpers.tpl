{{- define "ntfy.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "ntfy.labels" -}}
helm.sh/chart: {{ include "ntfy.chart" . }}
{{ include "ntfy.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "ntfy.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.ntfy.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
