pipeline {
    agent any
    
    environment {
        USE_ENV = true
        ENV_NAME = "test_us"
    }

    stages {
        stage('Get Code from Git Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/gedaprems/angular_lambda_config_project.git'
            }
        }
        
        stage('Create .env file') {
            steps {
                bat '''
                    if exist .env del /f /q .env
                    
                    @echo off
                    (
                        echo USE_ENV=%USE_ENV%
                        echo ENV_NAME=%ENV_NAME%
                    ) > .env
                '''
                withCredentials([string(credentialsId: 'TEST_ACCESS_KEY_ID', variable: 'TEST_ACCESS_KEY_ID')]) {
                    bat '''
                        @echo off
                        (
                            echo TEST_ACCESS_KEY_ID=%TEST_ACCESS_KEY_ID%
                        ) >> .env
                    '''
                }
                withCredentials([string(credentialsId: 'TEST_SECRET_ACCESS_KEY', variable: 'TEST_SECRET_ACCESS_KEY')]) {
                    bat '''
                        @echo off
                        (
                        echo TEST_SECRET_ACCESS_KEY=%TEST_SECRET_ACCESS_KEY%
                        ) >> .env
                    '''
                }
                bat '''
                    @echo off
                    move .env apps\\backend\\
                '''
            }
        }
        
        stage('Build Backend Image') {
            steps {
                bat '''
                    cd apps/backend
                    docker build -t my-backend .
                '''
            }
        }
        
        stage('Create and Run Backend Container') {
            steps {
                bat '''
                    docker run -d -p 3000:3000 --name my-backend-container my-backend
                '''
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                bat '''
                    cd apps/frontend
                    docker build -t my-frontend .
                '''
            }
        }
        
        stage('Create and Run Frontend Container') {
            steps {
                bat '''
                    docker run -d -p 4200:4200 --name my-frontend-container my-frontend
                '''
            }
        }
        
    }
}
