(function(){

"use strict";

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const TAMANHO_JANELA = 14;

const STORAGE_KEY =
"ANALISADOR_069_IDS_CORRESPONDENTES_V1";

const STORAGE_RX =
"ANALISADOR_069_TAMANHO_RX_V1";

const STORAGE_MODO_RX =
"ANALISADOR_069_MODO_RX_V1";

const STORAGE_AUTO_RX =
"ANALISADOR_069_AUTO_RX_ATUAL_V1";

const COR_T0 = "#00c853";
const COR_T6 = "#ffc107";
const COR_T9 = "#2196f3";

const PERCENTUAL_REPLICAS_RX = 0.10;
const MIN_REPLICAS_RX = 15;
const MAX_REPLICAS_RX = 40;
const MIN_ZONAS_RX = 8;

/*
5 setores de 2 vizinhos = 25 números
1 setor de 1 vizinho    = 3 números
TOTAL                   = 28 números
*/

const QTD_BLOCOS_2V = 5;
const QTD_BLOCOS_1V = 1;

/*
BACKTEST
*/

const MAX_TESTES_OFFSET = 200;

const OFFSETS_TESTADOS = [
    -2,
    -1,
    0,
    1,
    2
];

/*
AUTO

Para trocar automaticamente de RX,
o novo precisa superar o atual por
esta margem.

Evita:
4 → 5 → 4 → 6
por diferenças insignificantes.
*/

const MARGEM_TROCA_AUTO = 3.0;

let TAMANHO_RX = 6;
let MODO_RX = "AUTO";
let AUTO_RX_ATUAL = 6;


/* =========================================================
   CARREGAR CONFIGURAÇÃO
========================================================= */

try{

    const salvo =
    Number(
        localStorage.getItem(
            STORAGE_RX
        )
    );

    if(
        salvo === 4 ||
        salvo === 5 ||
        salvo === 6
    ){
        TAMANHO_RX = salvo;
    }

}catch(e){}


try{

    const salvo =
    localStorage.getItem(
        STORAGE_MODO_RX
    );

    if(
        salvo === "AUTO" ||
        salvo === "MANUAL"
    ){
        MODO_RX = salvo;
    }

}catch(e){}


try{

    const salvo =
    Number(
        localStorage.getItem(
            STORAGE_AUTO_RX
        )
    );

    if(
        salvo === 4 ||
        salvo === 5 ||
        salvo === 6
    ){
        AUTO_RX_ATUAL = salvo;
    }

}catch(e){}


/* =========================================================
   ROLETA EUROPEIA
========================================================= */

const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
];


const numerosVermelhos = new Set([
    1,3,5,7,9,
    12,14,16,18,
    19,21,23,25,27,
    30,32,34,36
]);


/* =========================================================
   REGIÕES VISUAIS
========================================================= */

const regioesRoleta = {

    ZERO:new Set([
        0,32,15,26,3,35,12
    ]),

    VOISINS:new Set([
        19,4,21,2,25,
        28,7,29,18,22
    ]),

    ORPHELINS:new Set([
        9,31,14,20,1,17,6,34
    ]),

    TIERS:new Set([
        27,13,36,11,30,8,
        23,10,5,24,16,33
    ])

};


const coresRegioes = {
    ZERO:"#9bea2c",
    VOISINS:"#8a20d4",
    ORPHELINS:"#176436",
    TIERS:"#29499b"
};


/* =========================================================
   IDS 0 / 6 / 9
========================================================= */

const BASES_069 = [
    0,10,20,30,
    6,16,26,36,
    9,19,29
];


const TODOS_IDS_RX = [
    0,10,20,30,
    6,16,26,36,
    9,19,29,39
];


const IDS_ESPECIAIS = {
    25:[39],
    17:[9],
    2:[9]
};


/* =========================================================
   HELPERS RODA
========================================================= */

function indiceRoda(numero){

    return track.indexOf(
        numero
    );

}


function numeroOffset(
    numero,
    offset
){

    const indice =
    indiceRoda(
        numero
    );

    if(indice < 0){
        return numero;
    }

    return track[
        (
            indice +
            offset +
            track.length
        )
        %
        track.length
    ];

}


function setorVizinhosOrdenado(
    centro,
    quantidade
){

    const indice =
    indiceRoda(
        centro
    );

    if(indice < 0){
        return [];
    }

    const numeros = [];

    for(
        let d=-quantidade;
        d<=quantidade;
        d++
    ){

        numeros.push(
            track[
                (
                    indice +
                    d +
                    track.length
                )
                %
                track.length
            ]
        );

    }

    return numeros;
}


function vizinhos(
    numero,
    quantidade=1
){

    const indice =
    indiceRoda(
        numero
    );

    if(indice < 0){
        return [];
    }

    const resultado =
    [numero];

    for(
        let d=1;
        d<=quantidade;
        d++
    ){

        resultado.push(
            track[
                (
                    indice -
                    d +
                    track.length
                )
                %
                track.length
            ]
        );

        resultado.push(
            track[
                (
                    indice +
                    d
                )
                %
                track.length
            ]
        );

    }

    return resultado;
}


/* =========================================================
   FAMÍLIAS
========================================================= */

function familiaDoId(id){

    if(
        id === 0 ||
        id === 10 ||
        id === 20 ||
        id === 30
    ){
        return 0;
    }

    if(
        id === 6 ||
        id === 16 ||
        id === 26 ||
        id === 36
    ){
        return 6;
    }

    if(
        id === 9 ||
        id === 19 ||
        id === 29 ||
        id === 39
    ){
        return 9;
    }

    return null;
}


function corDoId(id){

    const familia =
    familiaDoId(
        id
    );

    if(familia === 0){
        return COR_T0;
    }

    if(familia === 6){
        return COR_T6;
    }

    if(familia === 9){
        return COR_T9;
    }

    return "#555";
}


function corFamilia(familia){

    if(familia === 0){
        return COR_T0;
    }

    if(familia === 6){
        return COR_T6;
    }

    if(familia === 9){
        return COR_T9;
    }

    return "#777";
}


/* =========================================================
   COBERTURA IDS
========================================================= */

const coberturaDasBases = {};


BASES_069.forEach(
function(base){

    coberturaDasBases[base] =
    new Set(
        vizinhos(
            base,
            1
        )
    );

});


function idsQueBatem(numero){

    const ids = [];


    BASES_069.forEach(
    function(base){

        if(
            coberturaDasBases[base]
            .has(numero)
        ){
            ids.push(base);
        }

    });


    if(
        Object.prototype
        .hasOwnProperty
        .call(
            IDS_ESPECIAIS,
            numero
        )
    ){

        IDS_ESPECIAIS[numero]
        .forEach(
        function(id){

            if(
                !ids.includes(id)
            ){
                ids.push(id);
            }

        });

    }

    return ids;
}


function familiasQueBatem(numero){

    return new Set(

        idsQueBatem(numero)

        .map(familiaDoId)

        .filter(
        function(familia){

            return (
                familia !== null
            );

        })

    );
}


/* =========================================================
   REGIÕES
========================================================= */

function regiaoDoNumero(numero){

    if(
        regioesRoleta.ZERO
        .has(numero)
    ){
        return "ZERO";
    }

    if(
        regioesRoleta.VOISINS
        .has(numero)
    ){
        return "VOISINS";
    }

    if(
        regioesRoleta.ORPHELINS
        .has(numero)
    ){
        return "ORPHELINS";
    }

    if(
        regioesRoleta.TIERS
        .has(numero)
    ){
        return "TIERS";
    }

    return null;
}


/* =========================================================
   COR ROLETA
========================================================= */

function corNumeroRoleta(numero){

    if(numero === 0){

        return {
            fundo:"#087c48",
            texto:"#fff"
        };

    }

    if(
        numerosVermelhos
        .has(numero)
    ){

        return {
            fundo:"#c6283d",
            texto:"#fff"
        };

    }

    return {
        fundo:"#181818",
        texto:"#fff"
    };
}


/* =========================================================
   HISTÓRICO
========================================================= */

function carregarHistorico(){

    try{

        const salvo =
        localStorage.getItem(
            STORAGE_KEY
        );

        if(!salvo){
            return [];
        }

        const dados =
        JSON.parse(
            salvo
        );

        if(
            !Array.isArray(
                dados
            )
        ){
            return [];
        }

        return dados

        .map(Number)

        .filter(
        function(numero){

            return (
                Number.isInteger(numero) &&
                numero >= 0 &&
                numero <= 36
            );

        })

        .slice(-5000);


    }catch(e){

        return [];

    }
}


let historico =
carregarHistorico();


function salvarHistorico(){

    try{

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                historico
            )
        );

    }catch(e){}

}


function extrairNumeros(texto){

    const encontrados =
    texto.match(
        /\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
    );

    if(!encontrados){
        return [];
    }

    return encontrados

    .map(Number)

    .filter(
    function(numero){

        return (
            numero >= 0 &&
            numero <= 36
        );

    })

    .slice(-5000);
}


/* =========================================================
   CONTEXTO DE EVENTOS
   OTIMIZA O BACKTEST
========================================================= */

function criarContextoEventos(base){

    const chaves = [];
    const prefix0 = [0];
    const prefix6 = [0];
    const prefix9 = [0];

    let soma0 = 0;
    let soma6 = 0;
    let soma9 = 0;


    base.forEach(
    function(numero){

        const familias =
        familiasQueBatem(
            numero
        );

        const b0 =
        familias.has(0)
        ? 1
        : 0;

        const b6 =
        familias.has(6)
        ? 1
        : 0;

        const b9 =
        familias.has(9)
        ? 1
        : 0;


        let chave = "";

        if(b0) chave += "0";
        if(b6) chave += "6";
        if(b9) chave += "9";

        if(!chave){
            chave = "-";
        }

        chaves.push(
            chave
        );


        soma0 += b0;
        soma6 += b6;
        soma9 += b9;


        prefix0.push(
            soma0
        );

        prefix6.push(
            soma6
        );

        prefix9.push(
            soma9
        );

    });


    return {
        base,
        chaves,
        prefix0,
        prefix6,
        prefix9
    };
}


/* =========================================================
   SIMILARIDADE ENTRE JANELAS
========================================================= */

function similaridadeEntreJanelas(
    contexto,
    inicioAtual,
    inicioAntigo,
    tamanho
){

    let eventosIguais = 0;
    let erro = 0;


    for(
        let i=0;
        i<tamanho;
        i++
    ){

        if(
            contexto.chaves[
                inicioAtual+i
            ]
            ===
            contexto.chaves[
                inicioAntigo+i
            ]
        ){
            eventosIguais++;
        }


        const a0 =
        contexto.prefix0[
            inicioAtual+i+1
        ]
        -
        contexto.prefix0[
            inicioAtual
        ];


        const a6 =
        contexto.prefix6[
            inicioAtual+i+1
        ]
        -
        contexto.prefix6[
            inicioAtual
        ];


        const a9 =
        contexto.prefix9[
            inicioAtual+i+1
        ]
        -
        contexto.prefix9[
            inicioAtual
        ];


        const b0 =
        contexto.prefix0[
            inicioAntigo+i+1
        ]
        -
        contexto.prefix0[
            inicioAntigo
        ];


        const b6 =
        contexto.prefix6[
            inicioAntigo+i+1
        ]
        -
        contexto.prefix6[
            inicioAntigo
        ];


        const b9 =
        contexto.prefix9[
            inicioAntigo+i+1
        ]
        -
        contexto.prefix9[
            inicioAntigo
        ];


        erro +=
        Math.abs(
            a0-b0
        );

        erro +=
        Math.abs(
            a6-b6
        );

        erro +=
        Math.abs(
            a9-b9
        );

    }


    const scoreEventos =
    eventosIguais /
    tamanho *
    100;


    const maxErro =
    tamanho *
    tamanho *
    3;


    let scoreForma =
    1 -
    erro /
    maxErro;


    scoreForma =
    Math.max(
        0,
        Math.min(
            1,
            scoreForma
        )
    )
    *
    100;


    return (
        scoreEventos *
        0.80
        +
        scoreForma *
        0.20
    );
}


/* =========================================================
   PROCURAR RÉPLICAS
   totalUsavel = quantidade de resultados
   disponíveis naquele momento.
========================================================= */

function procurarReplicasNoIntervalo(
    contexto,
    totalUsavel,
    tamanho
){

    if(
        totalUsavel <
        tamanho * 2 + 1
    ){

        return {
            suficiente:false,
            replicas:[],
            totalJanelas:0
        };

    }


    const inicioAtual =
    totalUsavel -
    tamanho;


    const replicas = [];


    for(
        let inicio=0;
        inicio+tamanho<inicioAtual;
        inicio++
    ){

        const fim =
        inicio +
        tamanho;


        const proximo =
        contexto.base[
            fim
        ];


        if(
            proximo === undefined
        ){
            continue;
        }


        replicas.push({

            inicio,
            fim,
            proximo,

            similaridade:
            similaridadeEntreJanelas(
                contexto,
                inicioAtual,
                inicio,
                tamanho
            ),

            distancia:
            inicioAtual -
            fim

        });

    }


    replicas.sort(
    function(a,b){

        if(
            Math.abs(
                b.similaridade -
                a.similaridade
            )
            >
            0.0001
        ){

            return (
                b.similaridade -
                a.similaridade
            );

        }

        return (
            a.distancia -
            b.distancia
        );

    });


    return {
        suficiente:true,
        replicas,
        totalJanelas:
        replicas.length
    };
}


/* =========================================================
   ZONAS ENCONTRADAS
========================================================= */

function contarZonasDoGrupo(grupo){

    const zonas =
    new Set();


    grupo.forEach(
    function(item){

        idsQueBatem(
            item.proximo
        )
        .forEach(
        function(id){

            if(
                TODOS_IDS_RX
                .includes(id)
            ){
                zonas.add(id);
            }

        });

    });


    return zonas;
}


/* =========================================================
   SELECIONAR RÉPLICAS
========================================================= */

function selecionarReplicasNoIntervalo(
    contexto,
    totalUsavel,
    tamanho
){

    const busca =
    procurarReplicasNoIntervalo(
        contexto,
        totalUsavel,
        tamanho
    );


    if(
        !busca.suficiente
    ){

        return {
            estado:"AGUARDANDO",
            replicas:[],
            melhor:0,
            nivel:0,
            totalJanelas:0,
            zonasEncontradas:0
        };

    }


    if(
        !busca.replicas.length
    ){

        return {
            estado:"SEM DADOS",
            replicas:[],
            melhor:0,
            nivel:0,
            totalJanelas:0,
            zonasEncontradas:0
        };

    }


    const totalDisponivel =
    busca.replicas.length;


    let quantidadeInicial =
    Math.ceil(
        totalDisponivel *
        PERCENTUAL_REPLICAS_RX
    );


    quantidadeInicial =
    Math.max(
        quantidadeInicial,
        MIN_REPLICAS_RX
    );


    quantidadeInicial =
    Math.min(
        quantidadeInicial,
        totalDisponivel,
        MAX_REPLICAS_RX
    );


    const grupo =
    busca.replicas.slice(
        0,
        quantidadeInicial
    );


    let zonas =
    contarZonasDoGrupo(
        grupo
    );


    let indice =
    quantidadeInicial;


    while(
        zonas.size <
        MIN_ZONAS_RX
        &&
        indice <
        totalDisponivel
        &&
        grupo.length <
        MAX_REPLICAS_RX
    ){

        grupo.push(
            busca.replicas[
                indice
            ]
        );

        indice++;


        zonas =
        contarZonasDoGrupo(
            grupo
        );

    }


    return {

        estado:
        grupo.length
        ?
        "OK"
        :
        "SEM DADOS",

        replicas:
        grupo,

        melhor:
        busca.replicas[0]
        .similaridade,

        nivel:
        grupo.length
        ?
        grupo[
            grupo.length-1
        ].similaridade
        :
        0,

        totalJanelas:
        totalDisponivel,

        zonasEncontradas:
        zonas.size

    };
}


/* =========================================================
   FREQUÊNCIA DOS RESULTADOS DAS RÉPLICAS
========================================================= */

function gerarFrequenciaReplicas(
    replicas
){

    const frequencia =
    new Map();


    track.forEach(
    function(numero){

        frequencia.set(
            numero,
            0
        );

    });


    replicas.forEach(
    function(item){

        const numero =
        Number(
            item.proximo
        );


        if(
            frequencia.has(
                numero
            )
        ){

            frequencia.set(
                numero,
                frequencia.get(
                    numero
                )
                +
                1
            );

        }

    });


    return frequencia;
}


/* =========================================================
   AVALIAÇÃO ESTRATÉGICA DE SETOR
========================================================= */

function avaliarSetor(
    centro,
    quantidade,
    frequencia
){

    const numeros =
    setorVizinhosOrdenado(
        centro,
        quantidade
    );


    const ampliado =
    setorVizinhosOrdenado(
        centro,
        quantidade+1
    );


    if(
        !numeros.length ||
        !ampliado.length
    ){
        return null;
    }


    let ocorrencias = 0;
    let distintos = 0;
    let score = 0;


    numeros.forEach(
    function(numero,index){

        const quantidadeNumero =
        frequencia.get(
            numero
        )
        ||
        0;


        ocorrencias +=
        quantidadeNumero;


        if(
            quantidadeNumero > 0
        ){
            distintos++;
        }


        const distancia =
        Math.abs(
            index -
            quantidade
        );


        let pesoPosicao = 1;


        if(
            quantidade === 2
        ){

            if(
                distancia === 0
            ){
                pesoPosicao = 1.45;
            }

            else if(
                distancia === 1
            ){
                pesoPosicao = 1.20;
            }

            else{
                pesoPosicao = 1.00;
            }

        }

        else{

            if(
                distancia === 0
            ){
                pesoPosicao = 1.30;
            }

            else{
                pesoPosicao = 1.00;
            }

        }


        score +=
        quantidadeNumero *
        pesoPosicao;

    });


    const externoEsquerda =
    ampliado[0];


    const externoDireita =
    ampliado[
        ampliado.length-1
    ];


    const freqExtE =
    frequencia.get(
        externoEsquerda
    )
    ||
    0;


    const freqExtD =
    frequencia.get(
        externoDireita
    )
    ||
    0;


    /*
    Se os erros estão imediatamente
    depois do setor, o setor atual
    perde força e um setor deslocado
    tende a ganhar.
    */

    score -=
    (
        freqExtE +
        freqExtD
    )
    *
    0.35;


    return {

        centro,
        quantidade,
        numeros,

        ocorrencias,
        distintos,
        score,

        externoEsquerda,
        externoDireita,
        freqExtE,
        freqExtD

    };
}


/* =========================================================
   SOBREPOSIÇÃO
========================================================= */

function temSobreposicao(
    numeros,
    usados
){

    return numeros.some(
    function(numero){

        return usados.has(
            numero
        );

    });
}


/* =========================================================
   CANDIDATOS
========================================================= */

function gerarTodosCandidatos(
    quantidade,
    frequencia
){

    const lista = [];


    track.forEach(
    function(centro){

        const candidato =
        avaliarSetor(
            centro,
            quantidade,
            frequencia
        );


        if(candidato){
            lista.push(
                candidato
            );
        }

    });


    lista.sort(
    function(a,b){

        if(
            Math.abs(
                b.score -
                a.score
            )
            >
            0.0001
        ){

            return (
                b.score -
                a.score
            );

        }


        if(
            b.ocorrencias !==
            a.ocorrencias
        ){

            return (
                b.ocorrencias -
                a.ocorrencias
            );

        }


        if(
            b.distintos !==
            a.distintos
        ){

            return (
                b.distintos -
                a.distintos
            );

        }


        return (
            indiceRoda(
                a.centro
            )
            -
            indiceRoda(
                b.centro
            )
        );

    });


    return lista;
}


/* =========================================================
   JOGADA EXATA

   SEMPRE TENTA:

   5 SETORES 2V
   1 SETOR 1V

   SEM SOBREPOSIÇÃO.

   O algoritmo testa cada possível 1V
   como reserva e monta os cinco 2V
   restantes. Escolhe o conjunto de
   maior pontuação.
========================================================= */

function montarJogadaBaseDasReplicas(
    replicas
){

    const frequencia =
    gerarFrequenciaReplicas(
        replicas
    );


    const candidatos2 =
    gerarTodosCandidatos(
        2,
        frequencia
    );


    const candidatos1 =
    gerarTodosCandidatos(
        1,
        frequencia
    );


    let melhorPlano = null;


    candidatos1.forEach(
    function(reserva1){

        const usados =
        new Set(
            reserva1.numeros
        );


        const escolhidos2 = [];

        let scoreTotal =
        reserva1.score;


        for(
            const candidato
            of candidatos2
        ){

            if(
                escolhidos2.length >=
                QTD_BLOCOS_2V
            ){
                break;
            }


            if(
                temSobreposicao(
                    candidato.numeros,
                    usados
                )
            ){
                continue;
            }


            escolhidos2.push(
                candidato
            );


            scoreTotal +=
            candidato.score;


            candidato.numeros
            .forEach(
            function(numero){

                usados.add(
                    numero
                );

            });

        }


        if(
            escolhidos2.length !==
            QTD_BLOCOS_2V
        ){
            return;
        }


        if(
            usados.size !== 28
        ){
            return;
        }


        if(
            !melhorPlano
            ||
            scoreTotal >
            melhorPlano.scoreTotal
        ){

            melhorPlano = {

                blocos2:
                escolhidos2,

                blocos1:[
                    reserva1
                ],

                numerosUsados:
                usados,

                scoreTotal

            };

        }

    });


    /*
    Fallback geométrico.
    Só entra se a seleção normal não
    conseguiu montar 28 casas.
    */

    if(!melhorPlano){

        for(
            const reserva1
            of candidatos1
        ){

            const usados =
            new Set(
                reserva1.numeros
            );

            const blocos2 = [];


            for(
                const candidato
                of candidatos2
            ){

                if(
                    temSobreposicao(
                        candidato.numeros,
                        usados
                    )
                ){
                    continue;
                }


                blocos2.push(
                    candidato
                );


                candidato.numeros
                .forEach(
                function(numero){

                    usados.add(
                        numero
                    );

                });


                if(
                    blocos2.length ===
                    5
                ){
                    break;
                }

            }


            if(
                blocos2.length === 5
                &&
                usados.size === 28
            ){

                melhorPlano = {

                    blocos2,
                    blocos1:[
                        reserva1
                    ],
                    numerosUsados:
                    usados,
                    scoreTotal:0

                };

                break;

            }

        }

    }


    if(!melhorPlano){

        return {
            blocos2:[],
            blocos1:[],
            numerosUsados:
            new Set(),
            scoreTotal:0
        };

    }


    melhorPlano.blocos2.sort(
    function(a,b){

        return (
            b.score -
            a.score
        );

    });


    return melhorPlano;
}


/* =========================================================
   APLICAR OFFSET
========================================================= */

function aplicarOffsetJogada(
    jogada,
    offset
){

    function mover(bloco){

        const centro =
        numeroOffset(
            bloco.centro,
            offset
        );


        return {

            ...bloco,

            centro,

            numeros:
            setorVizinhosOrdenado(
                centro,
                bloco.quantidade
            )

        };

    }


    const blocos2 =
    jogada.blocos2.map(
        mover
    );


    const blocos1 =
    jogada.blocos1.map(
        mover
    );


    const numerosUsados =
    new Set();


    [
        ...blocos2,
        ...blocos1
    ]
    .forEach(
    function(bloco){

        bloco.numeros
        .forEach(
        function(numero){

            numerosUsados.add(
                numero
            );

        });

    });


    return {
        blocos2,
        blocos1,
        numerosUsados,
        totalNumeros:
        numerosUsados.size,
        offset
    };
}


/* =========================================================
   DISTÂNCIA DO RESULTADO ATÉ A JOGADA
========================================================= */

function distanciaAteCobertura(
    numero,
    cobertura
){

    if(
        cobertura.has(
            numero
        )
    ){
        return 0;
    }


    const indice =
    indiceRoda(
        numero
    );


    let menor =
    Infinity;


    cobertura.forEach(
    function(alvo){

        const outro =
        indiceRoda(
            alvo
        );


        let distancia =
        Math.abs(
            indice -
            outro
        );


        distancia =
        Math.min(
            distancia,
            track.length -
            distancia
        );


        if(
            distancia <
            menor
        ){
            menor =
            distancia;
        }

    });


    return menor;
}


/* =========================================================
   BACKTEST DE OFFSET

   WALK-FORWARD:
   para testar o resultado T,
   utiliza apenas resultados anteriores a T.
========================================================= */

function calibrarOffset(
    contexto,
    tamanhoRX
){

    const base =
    contexto.base;


    const minimoHistorico =
    Math.max(
        35,
        tamanhoRX * 4
    );


    const inicioTeste =
    Math.max(
        minimoHistorico,
        base.length -
        MAX_TESTES_OFFSET
    );


    const estatisticas =
    OFFSETS_TESTADOS.map(
    function(offset){

        return {

            offset,

            testes:0,
            acertos:0,
            perto1:0,
            perto2:0,

            pesoTotal:0,
            acertoPeso:0,

            recentesTestes:0,
            recentesAcertos:0

        };

    });


    if(
        base.length <=
        minimoHistorico
    ){

        return {
            offset:0,
            testes:0,
            melhor:null,
            estatisticas
        };

    }


    const quantidadePossivel =
    Math.max(
        1,
        base.length -
        inicioTeste
    );


    for(
        let indice=inicioTeste;
        indice<base.length;
        indice++
    ){

        const selecao =
        selecionarReplicasNoIntervalo(
            contexto,
            indice,
            tamanhoRX
        );


        if(
            selecao.estado !==
            "OK"
            ||
            !selecao.replicas.length
        ){
            continue;
        }


        const jogadaBase =
        montarJogadaBaseDasReplicas(
            selecao.replicas
        );


        if(
            jogadaBase.blocos2.length !== 5
            ||
            jogadaBase.blocos1.length !== 1
        ){
            continue;
        }


        const resultadoReal =
        base[
            indice
        ];


        /*
        Resultados recentes pesam mais
        no ranking automático.
        */

        const progresso =
        (
            indice -
            inicioTeste +
            1
        )
        /
        quantidadePossivel;


        const pesoTempo =
        0.35 +
        (
            progresso *
            0.65
        );


        const recente =
        indice >=
        base.length - 40;


        estatisticas.forEach(
        function(est){

            const jogada =
            aplicarOffsetJogada(
                jogadaBase,
                est.offset
            );


            const distancia =
            distanciaAteCobertura(
                resultadoReal,
                jogada.numerosUsados
            );


            est.testes++;

            est.pesoTotal +=
            pesoTempo;


            if(recente){
                est.recentesTestes++;
            }


            if(
                distancia === 0
            ){

                est.acertos++;

                est.acertoPeso +=
                pesoTempo;


                if(recente){
                    est.recentesAcertos++;
                }

            }

            else if(
                distancia === 1
            ){

                est.perto1++;

            }

            else if(
                distancia === 2
            ){

                est.perto2++;

            }

        });

    }


    estatisticas.forEach(
    function(est){

        est.percentual =
        est.testes
        ?
        est.acertos /
        est.testes *
        100
        :
        0;


        est.percentualPonderado =
        est.pesoTotal
        ?
        est.acertoPeso /
        est.pesoTotal *
        100
        :
        0;


        est.percentualRecente =
        est.recentesTestes
        ?
        est.recentesAcertos /
        est.recentesTestes *
        100
        :
        0;


        /*
        Offset:
        acerto manda.
        Erro a uma casa serve apenas
        como desempate secundário.
        */

        est.scoreOffset =
        (
            est.percentualPonderado *
            0.75
        )
        +
        (
            est.percentualRecente *
            0.20
        )
        +
        (
            est.testes
            ?
            (
                est.perto1 /
                est.testes *
                100
            )
            *
            0.04
            :
            0
        )
        +
        (
            est.testes
            ?
            (
                est.perto2 /
                est.testes *
                100
            )
            *
            0.01
            :
            0
        );

    });


    estatisticas.sort(
    function(a,b){

        if(
            Math.abs(
                b.scoreOffset -
                a.scoreOffset
            )
            >
            0.0001
        ){

            return (
                b.scoreOffset -
                a.scoreOffset
            );

        }


        if(
            b.acertos !==
            a.acertos
        ){

            return (
                b.acertos -
                a.acertos
            );

        }


        return (
            Math.abs(
                a.offset
            )
            -
            Math.abs(
                b.offset
            )
        );

    });


    const melhor =
    estatisticas[0];


    const offsetFinal =
    melhor
    &&
    melhor.testes >= 25
    ?
    melhor.offset
    :
    0;


    return {

        offset:
        offsetFinal,

        testes:
        melhor
        ?
        melhor.testes
        :
        0,

        melhor,

        estatisticas

    };
}


/* =========================================================
   RANKING RX
========================================================= */

function gerarRankingRX(
    selecao
){

    const mapa =
    new Map();


    TODOS_IDS_RX.forEach(
    function(id){

        mapa.set(
            id,
            {
                id,
                ocorrencias:0,
                melhorSimilaridade:0,
                maisRecente:Infinity,
                origem:"RX"
            }
        );

    });


    let somaSimilaridade = 0;

    let cont0 = 0;
    let cont6 = 0;
    let cont9 = 0;

    let totalFamilias = 0;


    selecao.replicas
    .forEach(
    function(item){

        somaSimilaridade +=
        item.similaridade;


        idsQueBatem(
            item.proximo
        )
        .forEach(
        function(id){

            if(
                !mapa.has(id)
            ){
                return;
            }


            const registro =
            mapa.get(id);


            registro.ocorrencias++;


            registro
            .melhorSimilaridade =
            Math.max(
                registro
                .melhorSimilaridade,
                item.similaridade
            );


            registro
            .maisRecente =
            Math.min(
                registro
                .maisRecente,
                item.distancia
            );

        });


        const familias =
        Array.from(
            familiasQueBatem(
                item.proximo
            )
        );


        if(
            familias.length
        ){

            const fracao =
            1 /
            familias.length;


            familias.forEach(
            function(familia){

                if(
                    familia === 0
                ){
                    cont0 += fracao;
                }

                if(
                    familia === 6
                ){
                    cont6 += fracao;
                }

                if(
                    familia === 9
                ){
                    cont9 += fracao;
                }

            });


            totalFamilias++;

        }

    });


    const ranking =
    Array.from(
        mapa.values()
    )
    .filter(
    function(item){

        return (
            item.ocorrencias >
            0
        );

    });


    ranking.sort(
    function(a,b){

        if(
            b.ocorrencias !==
            a.ocorrencias
        ){

            return (
                b.ocorrencias -
                a.ocorrencias
            );

        }


        if(
            Math.abs(
                b.melhorSimilaridade -
                a.melhorSimilaridade
            )
            >
            0.0001
        ){

            return (
                b.melhorSimilaridade -
                a.melhorSimilaridade
            );

        }


        if(
            a.maisRecente !==
            b.maisRecente
        ){

            return (
                a.maisRecente -
                b.maisRecente
            );

        }


        return (
            TODOS_IDS_RX
            .indexOf(a.id)
            -
            TODOS_IDS_RX
            .indexOf(b.id)
        );

    });


    const primeiros8 =
    ranking.slice(
        0,
        8
    );


    const tem0 =
    primeiros8.some(
        function(item){

            return (
                item.id === 0
            );

        }
    );


    const tem26 =
    primeiros8.some(
        function(item){

            return (
                item.id === 26
            );

        }
    );


    const top8 = [];
    const usados =
    new Set();


    for(
        let i=0;
        i<ranking.length &&
        top8.length<8;
        i++
    ){

        const item =
        ranking[i];


        if(
            usados.has(
                item.id
            )
        ){
            continue;
        }


        if(
            tem0 &&
            tem26 &&
            (
                item.id === 0 ||
                item.id === 26
            )
        ){

            const item0 =
            ranking.find(
                function(x){

                    return x.id === 0;

                }
            );


            const item26 =
            ranking.find(
                function(x){

                    return x.id === 26;

                }
            );


            if(
                item0 &&
                item26
            ){

                top8.push({

                    tipo:"ZERO26",

                    ids:[
                        0,
                        26
                    ],

                    idPrincipal:0,

                    label:"0 + 3",

                    ocorrencias:
                    item0.ocorrencias +
                    item26.ocorrencias,

                    ocorrencias0:
                    item0.ocorrencias,

                    ocorrencias26:
                    item26.ocorrencias,

                    origem:"RX"

                });


                usados.add(0);
                usados.add(26);

                continue;

            }

        }


        top8.push({

            tipo:"NORMAL",

            ids:[
                item.id
            ],

            idPrincipal:
            item.id,

            label:
            String(
                item.id
            ),

            ocorrencias:
            item.ocorrencias,

            origem:
            item.origem

        });


        usados.add(
            item.id
        );

    }


    TODOS_IDS_RX.forEach(
    function(id){

        if(
            top8.length >= 8
        ){
            return;
        }


        if(
            usados.has(id)
        ){
            return;
        }


        top8.push({

            tipo:"NORMAL",

            ids:[
                id
            ],

            idPrincipal:
            id,

            label:
            String(id),

            ocorrencias:0,

            origem:
            "SEM DADOS"

        });


        usados.add(id);

    });


    const p0 =
    totalFamilias
    ?
    cont0 /
    totalFamilias *
    100
    :
    0;


    const p6 =
    totalFamilias
    ?
    cont6 /
    totalFamilias *
    100
    :
    0;


    const p9 =
    totalFamilias
    ?
    cont9 /
    totalFamilias *
    100
    :
    0;


    const familiasOrdenadas = [

        {
            familia:0,
            valor:p0
        },

        {
            familia:6,
            valor:p6
        },

        {
            familia:9,
            valor:p9
        }

    ]
    .sort(
        function(a,b){

            return (
                b.valor -
                a.valor
            );

        }
    );


    return {

        top8:
        top8.slice(
            0,
            8
        ),

        familias:{
            0:p0,
            6:p6,
            9:p9
        },

        lider:
        familiasOrdenadas[0]
        .valor > 0
        ?
        familiasOrdenadas[0]
        :
        null,

        similaridade:
        selecao.replicas.length
        ?
        somaSimilaridade /
        selecao.replicas.length
        :
        0

    };
}


/* =========================================================
   ANALISAR UM RX ESPECÍFICO
========================================================= */

function analisarRXEspecifico(
    contexto,
    tamanho
){

    const selecao =
    selecionarReplicasNoIntervalo(
        contexto,
        historico.length,
        tamanho
    );


    if(
        selecao.estado !==
        "OK"
    ){

        return {

            tamanho,

            valido:false,

            replicas:0,

            totalJanelas:
            selecao.totalJanelas
            ||
            0,

            zonasEncontradas:0,

            similaridade:0,

            familias:{
                0:0,
                6:0,
                9:0
            },

            lider:null,

            ranking:[],

            jogada:{
                blocos2:[],
                blocos1:[],
                numerosUsados:
                new Set(),
                totalNumeros:0,
                offset:0
            },

            calibracao:null,

            forcaAuto:0

        };

    }


    const ranking =
    gerarRankingRX(
        selecao
    );


    const jogadaBase =
    montarJogadaBaseDasReplicas(
        selecao.replicas
    );


    const calibracao =
    calibrarOffset(
        contexto,
        tamanho
    );


    const jogada =
    aplicarOffsetJogada(
        jogadaBase,
        calibracao.offset
    );


    const melhorTeste =
    calibracao.melhor;


    const taxaPonderada =
    melhorTeste
    ?
    melhorTeste.percentualPonderado
    :
    0;


    const taxaRecente =
    melhorTeste
    ?
    melhorTeste.percentualRecente
    :
    0;


    /*
    FORÇA AUTOMÁTICA

    55% = desempenho ponderado do histórico
    20% = últimos 40 resultados
    20% = similaridade atual
    5%  = quantidade de zonas confirmadas

    Isso faz o AUTO acompanhar o RX
    que está mais casado com o momento
    atual sem ignorar o desempenho real.
    */

    const confirmacaoZonas =
    Math.min(
        100,
        (
            selecao.zonasEncontradas /
            8
        )
        *
        100
    );


    const forcaAuto =
    (
        taxaPonderada *
        0.55
    )
    +
    (
        taxaRecente *
        0.20
    )
    +
    (
        ranking.similaridade *
        0.20
    )
    +
    (
        confirmacaoZonas *
        0.05
    );


    return {

        tamanho,

        valido:
        jogada.blocos2.length === 5
        &&
        jogada.blocos1.length === 1
        &&
        jogada.numerosUsados.size === 28,

        replicas:
        selecao.replicas.length,

        totalJanelas:
        selecao.totalJanelas
        ||
        0,

        zonasEncontradas:
        selecao.zonasEncontradas
        ||
        0,

        similaridade:
        ranking.similaridade,

        familias:
        ranking.familias,

        lider:
        ranking.lider,

        ranking:
        ranking.top8,

        jogada,

        calibracao,

        forcaAuto,

        taxaPonderada,

        taxaRecente

    };
}


/* =========================================================
   AUTO 4 / 5 / 6
========================================================= */

function escolherMelhorRX(
    analises
){

    const validos =
    analises
    .filter(
    function(rx){

        return rx.valido;

    })
    .sort(
    function(a,b){

        if(
            Math.abs(
                b.forcaAuto -
                a.forcaAuto
            )
            >
            0.0001
        ){

            return (
                b.forcaAuto -
                a.forcaAuto
            );

        }


        if(
            Math.abs(
                b.taxaRecente -
                a.taxaRecente
            )
            >
            0.0001
        ){

            return (
                b.taxaRecente -
                a.taxaRecente
            );

        }


        if(
            Math.abs(
                b.similaridade -
                a.similaridade
            )
            >
            0.0001
        ){

            return (
                b.similaridade -
                a.similaridade
            );

        }


        return (
            a.tamanho -
            b.tamanho
        );

    });


    if(
        !validos.length
    ){
        return null;
    }


    const melhor =
    validos[0];


    const atual =
    validos.find(
        function(rx){

            return (
                rx.tamanho ===
                AUTO_RX_ATUAL
            );

        }
    );


    /*
    HISTERese:
    mantém o atual se a vantagem
    do concorrente for menor que 3 pontos.
    */

    let escolhido =
    melhor;


    if(
        atual
        &&
        melhor.tamanho !==
        atual.tamanho
        &&
        (
            melhor.forcaAuto -
            atual.forcaAuto
        )
        <
        MARGEM_TROCA_AUTO
    ){

        escolhido =
        atual;

    }


    AUTO_RX_ATUAL =
    escolhido.tamanho;


    try{

        localStorage.setItem(
            STORAGE_AUTO_RX,
            String(
                AUTO_RX_ATUAL
            )
        );

    }catch(e){}


    console.table(

        validos.map(
        function(rx){

            return {

                RX:
                rx.tamanho,

                FORCA:
                rx.forcaAuto
                .toFixed(1),

                HISTORICO:
                rx.taxaPonderada
                .toFixed(1) +
                "%",

                RECENTE:
                rx.taxaRecente
                .toFixed(1) +
                "%",

                SIMILARIDADE:
                rx.similaridade
                .toFixed(1) +
                "%",

                OFFSET:
                rx.jogada.offset,

                ATIVO:
                rx.tamanho ===
                escolhido.tamanho
                ?
                "SIM"
                :
                ""

            };

        })

    );


    return escolhido;
}


/* =========================================================
   ANÁLISE PRINCIPAL
========================================================= */

function analisarPrincipal(){

    const contexto =
    criarContextoEventos(
        historico
    );


    if(
        MODO_RX ===
        "MANUAL"
    ){

        const manual =
        analisarRXEspecifico(
            contexto,
            TAMANHO_RX
        );


        return {

            ativo:
            manual,

            rankingAuto:[
                manual
            ]

        };

    }


    const analises = [

        analisarRXEspecifico(
            contexto,
            4
        ),

        analisarRXEspecifico(
            contexto,
            5
        ),

        analisarRXEspecifico(
            contexto,
            6
        )

    ];


    const escolhido =
    escolherMelhorRX(
        analises
    );


    if(escolhido){

        TAMANHO_RX =
        escolhido.tamanho;

    }


    return {

        ativo:
        escolhido
        ||
        analises.find(
            function(rx){

                return rx.valido;

            }
        )
        ||
        analises[0],

        rankingAuto:
        analises
        .slice()
        .sort(
        function(a,b){

            return (
                b.forcaAuto -
                a.forcaAuto
            );

        })

    };
}


/* =========================================================
   ÚLTIMOS 14
========================================================= */

function analisarJanela14(){

    const janela =
    historico.slice(
        -TAMANHO_JANELA
    );


    return {

        janela,

        sequencia:
        janela.map(
        function(numero){

            return {

                numero,

                ids:
                idsQueBatem(
                    numero
                )

            };

        })

    };
}


/* =========================================================
   MODO AUTO / MANUAL
========================================================= */

function ativarAuto(){

    MODO_RX =
    "AUTO";


    try{

        localStorage.setItem(
            STORAGE_MODO_RX,
            MODO_RX
        );

    }catch(e){}


    invalidarCache();

    render();
}


function ativarManual(
    tamanho
){

    if(
        tamanho !== 4 &&
        tamanho !== 5 &&
        tamanho !== 6
    ){
        return;
    }


    MODO_RX =
    "MANUAL";

    TAMANHO_RX =
    tamanho;


    try{

        localStorage.setItem(
            STORAGE_MODO_RX,
            MODO_RX
        );


        localStorage.setItem(
            STORAGE_RX,
            String(
                TAMANHO_RX
            )
        );

    }catch(e){}


    invalidarCache();

    render();
}


/* =========================================================
   AÇÕES HISTÓRICO
========================================================= */

function inserirHistorico(){

    const campo =
    document.getElementById(
        "entradaHistorico"
    );


    const numeros =
    extrairNumeros(
        campo.value
    );


    if(
        !numeros.length
    ){

        statusArea.textContent =
        "Nenhum número válido.";


        statusArea.style.color =
        "#ff5252";


        return;

    }


    historico =
    numeros.slice(
        -5000
    );


    salvarHistorico();

    invalidarCache();


    campo.value = "";


    statusArea.textContent =
    historico.length +
    " números carregados.";


    statusArea.style.color =
    "#00e676";


    render();
}


function adicionarNumero(
    numero
){

    historico.push(
        numero
    );


    if(
        historico.length >
        5000
    ){
        historico.shift();
    }


    salvarHistorico();

    invalidarCache();


    statusArea.textContent =
    "Número " +
    numero +
    " inserido.";


    statusArea.style.color =
    "#00e5ff";


    render();
}


function apagarUltimo(){

    if(
        !historico.length
    ){
        return;
    }


    const apagado =
    historico.pop();


    salvarHistorico();

    invalidarCache();


    statusArea.textContent =
    "Número " +
    apagado +
    " apagado.";


    statusArea.style.color =
    "#ffc107";


    render();
}


function apagarTudo(){

    if(
        !window.confirm(
            "Apagar todo o histórico?"
        )
    ){
        return;
    }


    historico = [];


    salvarHistorico();

    invalidarCache();


    statusArea.textContent =
    "Histórico apagado.";


    statusArea.style.color =
    "#ff5252";


    render();
}


/* =========================================================
   INTERFACE
========================================================= */

document.body.innerHTML = "";

document.body.style.margin =
"0";

document.body.style.background =
"#101010";

document.body.style.color =
"#fff";

document.body.style.fontFamily =
"Arial,sans-serif";


const app =
document.createElement(
    "div"
);


app.innerHTML = `

<style>

*{
box-sizing:border-box;
}

button,
textarea{
font-family:Arial,sans-serif;
}

button{
cursor:pointer;
touch-action:manipulation;
}

.app069{
max-width:850px;
margin:auto;
padding:7px;
}

h2{
text-align:center;
margin:5px 0 10px;
font-size:22px;
}

.painel{
background:#1d1d1f;
border:1px solid #444;
border-radius:10px;
padding:9px;
margin-bottom:8px;
}

.tituloPainel{
font-size:11px;
font-weight:900;
color:#aaa;
}

.cabecalhoPainel{
display:flex;
align-items:center;
justify-content:space-between;
gap:6px;
}

.cabecalhoDireita{
display:flex;
align-items:center;
gap:5px;
}

.btnMostrar{
background:#292929;
border:1px solid #555;
color:#ddd;
border-radius:6px;
padding:5px 8px;
font-size:10px;
font-weight:900;
}

.conteudoOculto{
display:none;
margin-top:8px;
}

.seletorRX{
display:flex;
gap:3px;
align-items:center;
}

.btnRX{
min-width:29px;
height:27px;
padding:0 6px;
background:#202020;
border:1px solid #555;
border-radius:6px;
color:#888;
font-size:11px;
font-weight:900;
}

.btnRX.auto{
min-width:46px;
}

.btnRX.ativo{
background:#00a6c7;
border-color:#00e5ff;
color:#fff;
}

.btnRX.autoEscolhido{
border-color:#00e5ff;
color:#00e5ff;
box-shadow:0 0 6px rgba(0,229,255,.35);
}

textarea{
width:100%;
height:72px;
background:#111;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:8px;
resize:vertical;
}

.acoes{
display:flex;
gap:5px;
flex-wrap:wrap;
margin-top:6px;
}

.btn{
background:#333;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:8px 10px;
font-weight:900;
}

.btnVerde{
background:#146238;
}

.btnVermelho{
background:#762832;
}

.status{
margin-top:6px;
font-size:11px;
font-weight:900;
color:#aaa;
}

.linhaAnalise{
display:grid;
grid-template-columns:65px minmax(0,1fr);
gap:5px;
align-items:center;
margin-top:7px;
}

.rotulo{
font-size:9px;
font-weight:900;
color:#aaa;
}

.scrollLinha{
display:flex;
gap:4px;
overflow-x:auto;
padding-bottom:2px;
}

.numeroRoleta,
.numeroRegiao,
.idBox{
min-width:35px;
height:35px;
display:flex;
align-items:center;
justify-content:center;
font-weight:900;
font-size:13px;
}

.numeroRoleta{
border-radius:50%;
border:2px solid rgba(255,255,255,.75);
}

.numeroRegiao{
border-radius:7px;
border:1px solid #aaa;
}

.idBox{
border-radius:7px;
background:#111;
border:1px solid #444;
gap:2px;
padding:2px;
}

.tagID{
font-size:11px;
font-weight:900;
padding:6px 4px;
border-radius:5px;
color:#fff;
}

.semID{
color:#555;
}

.legendaRegioes{
display:flex;
justify-content:center;
gap:8px;
flex-wrap:wrap;
margin-top:8px;
font-size:9px;
color:#aaa;
}

.itemRegiao{
display:flex;
align-items:center;
gap:4px;
}

.corRegiao{
width:10px;
height:10px;
border-radius:3px;
}


/* JOGADA */

.jogadaBox{
background:#101010;
border:1px solid #444;
border-radius:8px;
padding:8px;
}

.jogadaSubtitulo{
font-size:9px;
font-weight:900;
color:#aaa;
margin:7px 0 5px;
}

.linhaJogadas{
display:flex;
gap:5px;
overflow-x:auto;
padding-bottom:4px;
}

.blocoJogada{
min-width:145px;
background:#181818;
border:1px solid #00e5ff;
border-radius:8px;
padding:8px;
text-align:center;
}

.blocoJogada.um{
border-color:#ffc107;
}

.blocoJogada small{
display:block;
font-size:8px;
font-weight:900;
color:#888;
}

.blocoJogada strong{
display:block;
font-size:22px;
margin:3px 0;
}

.centro2{
color:#00e5ff;
}

.centro1{
color:#ffc107;
}

.numerosCobertos{
font-size:11px;
font-weight:900;
color:#eee;
line-height:1.5;
padding-top:5px;
border-top:1px solid #333;
}


/* RX */

.raiox{
background:#101010;
border:1px solid #444;
border-radius:8px;
padding:8px;
}

.rxTopo{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:5px;
margin-bottom:7px;
}

.rxCard{
background:#181818;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center;
}

.rxCard small{
display:block;
font-size:8px;
color:#888;
font-weight:900;
}

.rxCard strong{
display:block;
font-size:15px;
margin-top:3px;
}

.rxFamilias{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:5px;
margin-bottom:7px;
}

.rxFamilia{
background:#171717;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center;
}

.rxFamilia strong{
font-size:17px;
}

.rxFamilia small{
display:block;
font-size:8px;
color:#888;
}

.rxSinal{
background:#111;
border:1px solid #444;
border-radius:8px;
text-align:center;
padding:8px;
margin-bottom:8px;
}

.rxSinal small{
display:block;
font-size:8px;
font-weight:900;
color:#888;
}

.rxSinal strong{
display:block;
font-size:26px;
margin-top:3px;
}

.rxRanking{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:4px;
}

.rxNumero{
background:#181818;
border:1px solid #3c3c3c;
border-radius:7px;
text-align:center;
padding:7px 2px;
min-height:68px;
}

.rxNumero strong{
display:block;
font-size:18px;
}

.rxNumero small{
display:block;
font-size:8px;
color:#888;
margin-top:2px;
}


/* TECLADO */

.teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:7px;
}

.numeroBtn{
height:40px;
border:1px solid #666;
border-radius:7px;
color:#fff;
font-weight:900;
font-size:14px;
}

.zeroBtn{
grid-column:span 6;
}


/* HISTÓRICO */

.historico{
display:flex;
gap:4px;
overflow-x:auto;
}

.histNumero{
min-width:31px;
height:31px;
display:flex;
align-items:center;
justify-content:center;
border-radius:6px;
border:1px solid #555;
font-size:12px;
font-weight:900;
}

.janelaAtual{
border:2px solid #00e5ff;
}

.ultimo{
box-shadow:0 0 8px #00e5ff;
}


@media(max-width:600px){

.app069{
padding:5px;
}

.painel{
padding:7px;
}

.linhaAnalise{
grid-template-columns:58px minmax(0,1fr);
}

.numeroRoleta,
.numeroRegiao,
.idBox{
min-width:34px;
height:34px;
}

.blocoJogada{
min-width:138px;
}

.rxTopo{
grid-template-columns:repeat(2,1fr);
}

}

</style>


<div class="app069">

<h2>
Análise 0 • 6 • 9
</h2>


<section class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico do mais antigo para o mais recente..."
></textarea>

<div class="acoes">

<button
id="btnInserir"
class="btn btnVerde"
>
Inserir histórico
</button>

<button
id="btnApagarUltimo"
class="btn"
>
Apagar último
</button>

<button
id="btnApagarTudo"
class="btn btnVermelho"
>
Apagar tudo
</button>

</div>

<div
id="statusArea"
class="status"
>
Cole o histórico ou use o teclado.
</div>

</section>


<section class="painel">

<div class="tituloPainel">

ÚLTIMOS
<span id="qtdJanela">
0
</span>/14

</div>


<div class="linhaAnalise">

<div class="rotulo">
ROLETA
</div>

<div
id="linhaCores"
class="scrollLinha"
></div>

</div>


<div class="linhaAnalise">

<div class="rotulo">
REGIÕES
</div>

<div
id="linhaRegioes"
class="scrollLinha"
></div>

</div>


<div class="linhaAnalise">

<div class="rotulo">
ID<br>0 • 6 • 9
</div>

<div
id="linhaIds"
class="scrollLinha"
></div>

</div>


<div class="legendaRegioes">

<div class="itemRegiao">
<span
class="corRegiao"
style="background:#9bea2c"
></span>
Zero
</div>

<div class="itemRegiao">
<span
class="corRegiao"
style="background:#8a20d4"
></span>
Voisins
</div>

<div class="itemRegiao">
<span
class="corRegiao"
style="background:#176436"
></span>
Orphelins
</div>

<div class="itemRegiao">
<span
class="corRegiao"
style="background:#29499b"
></span>
Tiers
</div>

</div>

</section>


<section class="painel">

<div class="cabecalhoPainel">

<div class="tituloPainel">
JOGADA SUGERIDA
</div>

<button
id="btnMostrarJogada"
class="btnMostrar"
>
Mostrar
</button>

</div>

<div
id="conteudoJogada"
class="conteudoOculto"
>

<div
id="jogadaArea"
class="jogadaBox"
></div>

</div>

</section>


<section class="painel">

<div class="cabecalhoPainel">

<div
id="tituloRaioX"
class="tituloPainel"
>
RAIO X
</div>

<div class="cabecalhoDireita">

<div class="seletorRX">

<button
id="rxAuto"
class="btnRX auto"
>
AUTO
</button>

<button
id="rx4"
class="btnRX"
>
4
</button>

<button
id="rx5"
class="btnRX"
>
5
</button>

<button
id="rx6"
class="btnRX"
>
6
</button>

</div>

<button
id="btnMostrarRaioX"
class="btnMostrar"
>
Mostrar
</button>

</div>

</div>

<div
id="conteudoRaioX"
class="conteudoOculto"
>

<div
id="raioX"
class="raiox"
></div>

</div>

</section>


<section class="painel">

<div class="tituloPainel">
TECLADO 0–36
</div>

<div
id="teclado"
class="teclado"
></div>

</section>


<section class="painel">

<div class="cabecalhoPainel">

<div class="tituloPainel">

HISTÓRICO OCULTO —
<span id="qtdHistorico">
0
</span>

</div>

<button
id="btnMostrarHistorico"
class="btnMostrar"
>
Mostrar
</button>

</div>

<div
id="conteudoHistorico"
class="conteudoOculto"
>

<div
id="historico"
class="historico"
></div>

</div>

</section>

</div>
`;


document.body.appendChild(
    app
);


/* =========================================================
   ELEMENTOS
========================================================= */

const statusArea =
document.getElementById(
    "statusArea"
);


const qtdJanela =
document.getElementById(
    "qtdJanela"
);


const linhaCores =
document.getElementById(
    "linhaCores"
);


const linhaRegioes =
document.getElementById(
    "linhaRegioes"
);


const linhaIds =
document.getElementById(
    "linhaIds"
);


const jogadaArea =
document.getElementById(
    "jogadaArea"
);


const raioX =
document.getElementById(
    "raioX"
);


const tituloRaioX =
document.getElementById(
    "tituloRaioX"
);


const teclado =
document.getElementById(
    "teclado"
);


const qtdHistorico =
document.getElementById(
    "qtdHistorico"
);


const elementoHistorico =
document.getElementById(
    "historico"
);


/* =========================================================
   PAINÉIS
========================================================= */

function configurarPainelOculto(
    botaoId,
    conteudoId
){

    const botao =
    document.getElementById(
        botaoId
    );


    const conteudo =
    document.getElementById(
        conteudoId
    );


    botao.onclick =
    function(){

        const aberto =
        conteudo.style.display ===
        "block";


        conteudo.style.display =
        aberto
        ?
        "none"
        :
        "block";


        botao.textContent =
        aberto
        ?
        "Mostrar"
        :
        "Ocultar";

    };

}


configurarPainelOculto(
    "btnMostrarJogada",
    "conteudoJogada"
);


configurarPainelOculto(
    "btnMostrarRaioX",
    "conteudoRaioX"
);


configurarPainelOculto(
    "btnMostrarHistorico",
    "conteudoHistorico"
);


/* =========================================================
   BOTÕES AUTO / MANUAL
========================================================= */

document
.getElementById(
    "rxAuto"
)
.onclick =
ativarAuto;


document
.getElementById(
    "rx4"
)
.onclick =
function(){

    ativarManual(4);

};


document
.getElementById(
    "rx5"
)
.onclick =
function(){

    ativarManual(5);

};


document
.getElementById(
    "rx6"
)
.onclick =
function(){

    ativarManual(6);

};


/* =========================================================
   ATUALIZAR BOTÕES
========================================================= */

function atualizarBotoesRX(){

    const btnAuto =
    document.getElementById(
        "rxAuto"
    );


    btnAuto.classList.toggle(
        "ativo",
        MODO_RX ===
        "AUTO"
    );


    [4,5,6]
    .forEach(
    function(numero){

        const botao =
        document.getElementById(
            "rx" +
            numero
        );


        botao.classList.remove(
            "ativo"
        );


        botao.classList.remove(
            "autoEscolhido"
        );


        botao.textContent =
        String(
            numero
        );


        if(
            MODO_RX ===
            "MANUAL"
            &&
            TAMANHO_RX ===
            numero
        ){

            botao.classList.add(
                "ativo"
            );

        }


        if(
            MODO_RX ===
            "AUTO"
            &&
            TAMANHO_RX ===
            numero
        ){

            botao.classList.add(
                "autoEscolhido"
            );


            botao.textContent =
            numero +
            " ★";

        }

    });


    if(
        MODO_RX ===
        "AUTO"
    ){

        tituloRaioX.textContent =
        "RAIO X " +
        TAMANHO_RX +
        " — MAIS FORTE";

    }

    else{

        tituloRaioX.textContent =
        "RAIO X " +
        TAMANHO_RX +
        " — MANUAL";

    }

}


/* =========================================================
   TECLADO
========================================================= */

for(
    let numero=1;
    numero<=36;
    numero++
){

    const botao =
    document.createElement(
        "button"
    );


    const cor =
    corNumeroRoleta(
        numero
    );


    botao.className =
    "numeroBtn";


    botao.textContent =
    numero;


    botao.style.background =
    cor.fundo;


    botao.onclick =
    function(){

        adicionarNumero(
            numero
        );

    };


    teclado.appendChild(
        botao
    );

}


const zero =
document.createElement(
    "button"
);


zero.className =
"numeroBtn zeroBtn";


zero.textContent =
"0";


zero.style.background =
"#087c48";


zero.onclick =
function(){

    adicionarNumero(0);

};


teclado.appendChild(
    zero
);


/* =========================================================
   BOTÕES HISTÓRICO
========================================================= */

document
.getElementById(
    "btnInserir"
)
.onclick =
inserirHistorico;


document
.getElementById(
    "btnApagarUltimo"
)
.onclick =
apagarUltimo;


document
.getElementById(
    "btnApagarTudo"
)
.onclick =
apagarTudo;


/* =========================================================
   RENDER 14
========================================================= */

function renderJanela(){

    const analise =
    analisarJanela14();


    qtdJanela.textContent =
    analise.janela.length;


    linhaCores.innerHTML =

    analise.janela

    .map(
    function(numero){

        const cor =
        corNumeroRoleta(
            numero
        );


        return (

            '<div class="numeroRoleta" ' +

            'style="background:' +
            cor.fundo +
            ';color:' +
            cor.texto +
            '">' +

            numero +

            '</div>'

        );

    })

    .join("");


    linhaRegioes.innerHTML =

    analise.janela

    .map(
    function(numero){

        const regiao =
        regiaoDoNumero(
            numero
        );


        const cor =
        regiao
        ?
        coresRegioes[
            regiao
        ]
        :
        "#555";


        return (

            '<div class="numeroRegiao" ' +

            'style="background:' +
            cor +
            '">' +

            numero +

            '</div>'

        );

    })

    .join("");


    linhaIds.innerHTML =

    analise.sequencia

    .map(
    function(item){

        if(
            !item.ids.length
        ){

            return (

                '<div class="idBox">' +
                '<span class="semID">—</span>' +
                '</div>'

            );

        }


        return (

            '<div class="idBox">' +

            item.ids

            .map(
            function(id){

                return (

                    '<span class="tagID" ' +

                    'style="background:' +
                    corDoId(id) +
                    '">' +

                    id +

                    '</span>'

                );

            })

            .join("") +

            '</div>'

        );

    })

    .join("");

}


/* =========================================================
   RENDER JOGADA
========================================================= */

function renderJogada(rx){

    if(
        !rx
        ||
        !rx.jogada
        ||
        rx.jogada.blocos2.length !== 5
        ||
        rx.jogada.blocos1.length !== 1
    ){

        jogadaArea.innerHTML =

        '<div style="' +
        'text-align:center;' +
        'color:#777;' +
        'padding:8px' +
        '">' +

        'Aguardando análise.' +

        '</div>';


        return;

    }


    const html2 =

    rx.jogada.blocos2

    .map(
    function(bloco){

        return (

            '<div class="blocoJogada">' +

            '<small>2 VIZINHOS DO</small>' +

            '<strong class="centro2">' +
            bloco.centro +
            '</strong>' +

            '<div class="numerosCobertos">' +

            bloco.numeros
            .join(
                " • "
            ) +

            '</div>' +

            '</div>'

        );

    })

    .join("");


    const html1 =

    rx.jogada.blocos1

    .map(
    function(bloco){

        return (

            '<div class="blocoJogada um">' +

            '<small>1 VIZINHO DO</small>' +

            '<strong class="centro1">' +
            bloco.centro +
            '</strong>' +

            '<div class="numerosCobertos">' +

            bloco.numeros
            .join(
                " • "
            ) +

            '</div>' +

            '</div>'

        );

    })

    .join("");


    jogadaArea.innerHTML =

    '<div class="jogadaSubtitulo">' +
    '2 VIZINHOS' +
    '</div>' +

    '<div class="linhaJogadas">' +
    html2 +
    '</div>' +

    '<div class="jogadaSubtitulo">' +
    '1 VIZINHO' +
    '</div>' +

    '<div class="linhaJogadas">' +
    html1 +
    '</div>';

}


/* =========================================================
   RENDER RX
========================================================= */

function renderRaioX(rx){

    if(
        !rx ||
        !rx.ranking.length
    ){

        raioX.innerHTML =

        '<div style="' +
        'text-align:center;' +
        'color:#777;' +
        'padding:15px' +
        '">' +

        'Aguardando histórico suficiente.' +

        '</div>';


        return;

    }


    const rankingHTML =

    rx.ranking

    .map(
    function(item,index){

        const cor =
        corFamilia(
            familiaDoId(
                item.idPrincipal
            )
        );


        let ocorrencias =
        item.ocorrencias +
        "x";


        if(
            item.tipo ===
            "ZERO26"
        ){

            ocorrencias =
            "0:" +
            item.ocorrencias0 +
            "x • 26:" +
            item.ocorrencias26 +
            "x";

        }


        return (

            '<div class="rxNumero" ' +

            'style="border-color:' +
            cor +
            '">' +

            '<small>#' +
            (index+1) +
            '</small>' +

            '<strong style="color:' +
            cor +
            '">' +

            item.label +

            '</strong>' +

            '<small>' +
            ocorrencias +
            '</small>' +

            '<small>' +
            item.origem +
            '</small>' +

            '</div>'

        );

    })

    .join("");


    let sinal =

    '<div class="rxSinal">' +
    '<small>SINAL</small>' +
    '<strong style="color:#777">—</strong>' +
    '</div>';


    if(
        rx.lider
    ){

        sinal =

        '<div class="rxSinal">' +

        '<small>SINAL</small>' +

        '<strong style="color:' +
        corFamilia(
            rx.lider.familia
        ) +
        '">' +

        rx.lider.familia +

        '</strong>' +

        '</div>';

    }


    raioX.innerHTML =

    '<div class="rxTopo">' +


    '<div class="rxCard">' +

    '<small>RÉPLICAS USADAS</small>' +

    '<strong>' +
    rx.replicas +
    '</strong>' +

    '</div>' +


    '<div class="rxCard">' +

    '<small>JANELAS</small>' +

    '<strong>' +
    rx.totalJanelas +
    '</strong>' +

    '</div>' +


    '<div class="rxCard">' +

    '<small>ZONAS DO RX</small>' +

    '<strong>' +
    rx.zonasEncontradas +
    '</strong>' +

    '</div>' +


    '<div class="rxCard">' +

    '<small>SIMILARIDADE</small>' +

    '<strong>' +
    rx.similaridade
    .toFixed(1) +
    '%' +

    '</strong>' +

    '</div>' +


    '</div>' +


    '<div class="rxFamilias">' +


    '<div class="rxFamilia">' +

    '<strong style="color:' +
    COR_T0 +
    '">' +

    rx.familias[0]
    .toFixed(0) +
    '%' +

    '</strong>' +

    '<small>0</small>' +

    '</div>' +


    '<div class="rxFamilia">' +

    '<strong style="color:' +
    COR_T6 +
    '">' +

    rx.familias[6]
    .toFixed(0) +
    '%' +

    '</strong>' +

    '<small>6</small>' +

    '</div>' +


    '<div class="rxFamilia">' +

    '<strong style="color:' +
    COR_T9 +
    '">' +

    rx.familias[9]
    .toFixed(0) +
    '%' +

    '</strong>' +

    '<small>9</small>' +

    '</div>' +


    '</div>' +


    sinal +


    '<div class="tituloPainel" ' +
    'style="margin-bottom:5px">' +

    '8 ZONAS — RAIO X ' +
    rx.tamanho +

    '</div>' +


    '<div class="rxRanking">' +

    rankingHTML +

    '</div>';

}


/* =========================================================
   HISTÓRICO
========================================================= */

function renderHistorico(){

    qtdHistorico.textContent =
    historico.length;


    const visiveis =
    historico.slice(
        -100
    );


    const offset =
    historico.length -
    visiveis.length;


    const inicioJanela =
    Math.max(
        0,
        historico.length -
        TAMANHO_JANELA
    );


    elementoHistorico.innerHTML =

    visiveis

    .map(
    function(numero,index){

        const indiceReal =
        offset +
        index;


        const cor =
        corNumeroRoleta(
            numero
        );


        return (

            '<div class="' +

            'histNumero ' +

            (
                indiceReal >=
                inicioJanela
                ?
                'janelaAtual '
                :
                ''
            ) +

            (
                indiceReal ===
                historico.length-1
                ?
                'ultimo'
                :
                ''
            ) +

            '" style="' +

            'background:' +
            cor.fundo +
            ';color:' +
            cor.texto +

            '">' +

            numero +

            '</div>'

        );

    })

    .join("");


    elementoHistorico.scrollLeft =
    elementoHistorico.scrollWidth;

}


/* =========================================================
   CACHE
========================================================= */

let cacheChave = "";
let cacheResultado = null;


function invalidarCache(){

    cacheChave = "";
    cacheResultado = null;

}


function assinaturaHistorico(){

    let hash =
    2166136261;


    for(
        let i=0;
        i<historico.length;
        i++
    ){

        hash ^=
        (
            historico[i] +
            i
        );


        hash =
        Math.imul(
            hash,
            16777619
        );

    }


    return (
        hash >>>
        0
    );
}


function obterAnaliseAtual(){

    const chave =

    MODO_RX +
    "|" +
    TAMANHO_RX +
    "|" +
    AUTO_RX_ATUAL +
    "|" +
    historico.length +
    "|" +
    assinaturaHistorico();


    if(
        cacheResultado
        &&
        cacheChave ===
        chave
    ){

        return cacheResultado;

    }


    cacheResultado =
    analisarPrincipal();


    cacheChave =
    chave;


    return cacheResultado;
}


/* =========================================================
   RENDER GERAL
========================================================= */

function render(){

    try{

        renderJanela();

        renderHistorico();


        const resultado =
        obterAnaliseAtual();


        const rx =
        resultado.ativo;


        if(
            rx &&
            MODO_RX ===
            "AUTO"
        ){

            TAMANHO_RX =
            rx.tamanho;

        }


        atualizarBotoesRX();


        try{

            renderRaioX(
                rx
            );

        }catch(erro){

            console.error(
                "Erro no Raio X:",
                erro
            );

        }


        try{

            renderJogada(
                rx
            );

        }catch(erro){

            console.error(
                "Erro na jogada:",
                erro
            );


            jogadaArea.innerHTML =
            "Erro ao montar jogada.";

        }


    }catch(erro){

        console.error(
            "Erro geral:",
            erro
        );


        statusArea.textContent =
        "Erro: " +
        (
            erro &&
            erro.message
            ?
            erro.message
            :
            "erro desconhecido"
        );


        statusArea.style.color =
        "#ff5252";

    }

}


/* =========================================================
   INICIAR
========================================================= */

render();

})();
