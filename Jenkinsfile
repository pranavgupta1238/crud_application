pipeline {
  agent any

  tools {
    nodejs "NodeJS 20"
  }

  stages {
    stage("Install backend dependencies") {
      steps {
        dir("backend") {
          sh "npm ci"
        }
      }
    }

    stage("Install frontend dependencies") {
      steps {
        dir("frontend") {
          sh "npm ci"
        }
      }
    }

    stage("Validate backend") {
      steps {
        dir("backend") {
          sh "node --check server.js"
        }
      }
    }

    stage("Build frontend") {
      steps {
        dir("frontend") {
          sh "npm run build"
        }
      }
    }

    stage("Validate Docker Compose") {
      steps {
        sh "docker compose config"
      }
    }
  }

  post {
    always {
      echo "CRUD application Jenkins pipeline finished."
    }
  }
}
