@echo off
REM Script para facilitar o uso do projeto AutoV7 Django
REM Uso: manage.bat [comando]

set PYTHON_PATH=C:\Users\pgmsa\AppData\Local\Programs\Python\Python313\python.exe

if "%1"=="setup" goto setup
if "%1"=="run" goto run
if "%1"=="admin" goto admin
if "%1"=="reset" goto reset
if "%1"=="test" goto test
if "%1"=="migrate" goto migrate
if "%1"=="populate" goto populate
goto help

:setup
echo [INFO] Configurando projeto AutoV7 Django...
pip install -r requirements.txt
%PYTHON_PATH% manage.py migrate
%PYTHON_PATH% manage.py populate_db
echo [INFO] Setup concluido! Use 'manage.bat run' para iniciar o servidor.
goto end

:run
echo [INFO] Iniciando servidor Django...
echo [INFO] Servidor disponivel em: http://localhost:8000
echo [INFO] Admin disponivel em: http://localhost:8000/admin/
echo [INFO] Pressione Ctrl+C para parar o servidor
%PYTHON_PATH% manage.py runserver
goto end

:admin
echo [INFO] Criando superusuario...
%PYTHON_PATH% manage.py createsuperuser
goto end

:reset
echo [WARN] Resetando banco de dados...
if exist db.sqlite3 del db.sqlite3
%PYTHON_PATH% manage.py migrate
%PYTHON_PATH% manage.py populate_db
echo [INFO] Banco resetado e populado!
goto end

:test
echo [INFO] Executando testes...
%PYTHON_PATH% manage.py test
goto end

:migrate
echo [INFO] Aplicando migracoes...
%PYTHON_PATH% manage.py migrate
goto end

:populate
echo [INFO] Populando banco com dados de exemplo...
%PYTHON_PATH% manage.py populate_db
goto end

:help
echo.
echo Uso: manage.bat [comando]
echo.
echo Comandos disponiveis:
echo   setup    - Configuracao inicial do projeto
echo   run      - Executar servidor Django
echo   admin    - Criar superusuario
echo   reset    - Reset do banco de dados
echo   test     - Executar testes
echo   migrate  - Aplicar migracoes
echo   populate - Popular banco com dados de exemplo
echo.
echo Exemplos:
echo   manage.bat setup
echo   manage.bat run
echo   manage.bat admin
echo.

:end
