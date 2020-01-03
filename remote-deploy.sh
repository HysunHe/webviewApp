# Remote deployment.
ssh -i /c/Projects/sehub/id_rsa opc@o100.odainfra.com -t "sudo su - oracle -c ./upgrade-odaqr2.sh"