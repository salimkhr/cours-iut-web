# Se connecter (utilise votre token GitHub)
echo $GITHUB_TOKEN | docker login ghcr.io -u salimkhr --password-stdin

# Pull l'image
docker pull ghcr.io/salimkhr/cours-iut-web:latest