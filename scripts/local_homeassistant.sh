#!/bin/bash

startMinikube=$(cat <<EOF
    minikube status > /dev/null 2>&1
    if [ \$? -eq 0 ]; then
        echo -e "\nMinikube is already running\n"
    else
        echo -e "\nStarting Minikube...\n"
        minikube start
    fi
EOF
)

minikubeDashboard='minikube dashboard'

minikubeMount='minikube mount ~/www/pheliperocha/home-assistant-config:/data'

helmInstall=$(cat <<EOF
    export AWS_PROFILE=pheliperocha
    ktx minikube
    cd ~/www/pheliperocha/home-server/kube
    helm secrets upgrade --install -n home-server home-server . \
    --values values.yaml \
    --values secrets.yaml \
    --values test-values.yaml \
    --set homeassistant.enabled=true \
    --set homeassistant.use_local_mount=true \
    --set pg-homeassistant.enabled=true
EOF
)

portForward='
kubectl port-forward service/homeassistant-service 8123:8123 -n home-server
'

openLocalHomeAssistant='xdg-open http://localhost:8123'

main=$(cat <<EOF
    $startMinikube
    gnome-terminal --tab --title "Mounting" -- bash -c "$minikubeMount; exec bash"
    $helmInstall
    sleep 30
    gnome-terminal --tab --title "Port forward Home Assistant" -- bash -c "$portForward; exec bash"
    $openLocalHomeAssistant
    $minikubeDashboard
EOF
)

# Open main terminal
gnome-terminal --tab --title "Minukube" -- bash -c "$main; exec bash"