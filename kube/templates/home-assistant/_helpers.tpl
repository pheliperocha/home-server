{{- define "homeassistant.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "homeassistant.labels" -}}
helm.sh/chart: {{ include "homeassistant.chart" . }}
{{ include "homeassistant.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "homeassistant.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.homeassistant.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
