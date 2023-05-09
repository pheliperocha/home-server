{{- define "drone.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "drone.labels" -}}
helm.sh/chart: {{ include "drone.chart" . }}
{{ include "drone.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "drone.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.drone.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
