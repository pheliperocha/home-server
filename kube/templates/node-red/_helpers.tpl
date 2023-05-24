{{- define "nodered.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "nodered.labels" -}}
helm.sh/chart: {{ include "nodered.chart" . }}
{{ include "nodered.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "nodered.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.nodered.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
