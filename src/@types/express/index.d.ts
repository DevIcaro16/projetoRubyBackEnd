//Declarando um novo atributo do tipo Request do Express:

declare namespace Express{
    export interface Request{
        user_id: string
    }
}