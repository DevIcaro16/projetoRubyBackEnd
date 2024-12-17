import prismaClient from "../../prisma";

class ResgatarPlanosService{
    async execute(){
      try {
        const planosBD = await prismaClient.plano.findMany({
            select:{
                id: true,
                max: true,
                val: true,
                des: true,
                tip: true
            }
        });

        return{
            success: true,
            planos: planosBD
        }
      } catch (error) {
        return {
            success: false,
            message: error
        }
      }       
    }
}

export { ResgatarPlanosService };