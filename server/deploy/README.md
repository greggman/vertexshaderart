*   deploy

       ./push_local.sh
       ./push_live.sh

*   see logs

        docker logs -f c_meteor_1   # local
        ssh vertexshaderart.com 'docker logs -f c_meteor_1'

*   ssh into meteor container

        docker exec -it c_meteor_1 bash
        ssh vertexshaderart.com -t 'docker exec -it c_meteor_1 bash'

*   run mongo interactive shell on container

        docker exec -it c_mongo_1 mongo
        ssh vertexshaderart.com -t 'docker exec -it c_mongo_1 mongo'

