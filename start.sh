#!/bin/bash

# 🔥 Pega seu IP local automaticamente
IP=$(ipconfig getifaddr en0)

# 🔍 Mostra no terminal qual IP está sendo usado
echo "🌐 Seu IP local é: $IP"
echo "🚀 Abra no Dev Client este link:"
echo "exp://$IP:8081"

# 🧠 Gera um QR Code no terminal (precisa do qrencode instalado)
if command -v qrencode &> /dev/null
then
    echo "🔗 QR Code:"
    qrencode -t UTF8 "exp://$IP:8081"
else
    echo "⚠️ qrencode não encontrado. Instale com: brew install qrencode"
fi

# 🟩 Inicia o Expo no modo Dev Client
npx expo start --dev-client --host=lan
