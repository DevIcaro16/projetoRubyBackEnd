import express, { Request, Response, NextFunction } from "express";


import "express-async-errors";



//Por algum motivo, a ordem da importação do arquivo de rotas bagunçou o throw new Err().     
//OBS: Deixar ele abaixo do import acima (empress-async-erros).
import { router } from "./routes";

import cors from "cors";
 
  
import dotenv from "dotenv"; 


dotenv.config(); 
   
const app = express(); 

app.use(express.json());

// app.use(cors());
// app.use(cors({
//   origin: "http://www.micromoney.com.br",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições de qualquer origem
    callback(null, true);
  },
}));


app.use(router); 


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof Error){
      //Se for uma instancia do tipo error
      return res.status(400).json({
        error: err.message
      })
    }
  
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error.'
    })
  
  })




const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(3200, () =>{
    console.log(`Servidor da Aplicação Rodando na Porta: ${port}`);
});
 