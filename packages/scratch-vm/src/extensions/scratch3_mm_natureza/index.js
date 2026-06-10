const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const formatMessage = require('format-message');

// ---------------------------------------------------------------------------
// Helpers para ler os globals window.* escritos por webrtc.js /
// updateWindowGlobals (SocketComponent.tsx)
// ---------------------------------------------------------------------------

/** @returns {number} hora atual 0-23 */
function getHora () {
    return typeof window !== 'undefined' && typeof window.horaCorrente === 'number'
        ? window.horaCorrente
        : 0;
}

/** @returns {boolean} */
function getEhDia () {
    return typeof window !== 'undefined' ? !!window.ehDia : false;
}

/** @returns {string} ex: 'LIMPO' | 'CHUVOSO' | 'NUBLADO' */
function getClima () {
    return typeof window !== 'undefined' && window.clima ? String(window.clima) : 'LIMPO';
}

/** @returns {number} 0=FRIO | 1=FRESCO | 2=MORNO | 3=QUENTE */
function getTemperatura () {
    return typeof window !== 'undefined' && typeof window.temperatura === 'number'
        ? window.temperatura
        : 2;
}

/** @returns {string} ex: 'VERAO' | 'INVERNO' | 'OUTONO' | 'PRIMAVERA' */
function getEstacao () {
    return typeof window !== 'undefined' && window.estacaoCorrente
        ? String(window.estacaoCorrente)
        : 'VERAO';
}

/** @returns {string} ex: 'NOVA' | 'CRESCENTE' | 'CHEIA' | 'MINGUANTE' */
function getFaseLua () {
    return typeof window !== 'undefined' && window.faseLuaCorrente
        ? String(window.faseLuaCorrente)
        : 'NOVA';
}

/** @returns {number} 0=domingo … 6=sábado */
function getDiaSemana () {
    return typeof window !== 'undefined' && typeof window.diaSemanaCorrente === 'number'
        ? window.diaSemanaCorrente
        : 0;
}

/** @returns {number} 1-31 */
function getDiaMes () {
    return typeof window !== 'undefined' && typeof window.diaMesCorrente === 'number'
        ? window.diaMesCorrente
        : 1;
}

/** @returns {number} 1-12 */
function getMes () {
    return typeof window !== 'undefined' && typeof window.mesCorrente === 'number'
        ? window.mesCorrente
        : 1;
}

/** @returns {number} 2-digit year */
function getAno () {
    return typeof window !== 'undefined' && typeof window.anoCorrente === 'number'
        ? window.anoCorrente
        : 0;
}

// ---------------------------------------------------------------------------
// Menus (items estáticos)
// ---------------------------------------------------------------------------

const CLIMA_OPCOES = [
    { text: 'bom (limpo)', value: 'LIMPO' },
    { text: 'chuvoso',     value: 'CHUVOSO' },
    { text: 'nublado',     value: 'NUBLADO' }
];

const TEMP_OPCOES = [
    { text: 'frio',   value: '0' },
    { text: 'fresco', value: '1' },
    { text: 'morno',  value: '2' },
    { text: 'quente', value: '3' }
];

const ESTACAO_OPCOES = [
    { text: 'Verão',     value: 'VERAO' },
    { text: 'Inverno',   value: 'INVERNO' },
    { text: 'Outono',    value: 'OUTONO' },
    { text: 'Primavera', value: 'PRIMAVERA' }
];

const LUA_OPCOES = [
    { text: 'nova',      value: 'NOVA' },
    { text: 'crescente', value: 'CRESCENTE' },
    { text: 'cheia',     value: 'CHEIA' },
    { text: 'minguante', value: 'MINGUANTE' }
];

const DIA_SEMANA_OPCOES = [
    { text: 'domingo',   value: '0' },
    { text: 'segunda',   value: '1' },
    { text: 'terça',     value: '2' },
    { text: 'quarta',    value: '3' },
    { text: 'quinta',    value: '4' },
    { text: 'sexta',     value: '5' },
    { text: 'sábado',    value: '6' }
];

// Horas 0-23 como itens de menu
const HORA_OPCOES = Array.from({ length: 24 }, (_, i) => ({
    text: String(i),
    value: String(i)
}));

// ---------------------------------------------------------------------------
// Extensão principal
// ---------------------------------------------------------------------------

class Scratch3MMNaturezaBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        // Para HAT edgeActivated: rastrear estado anterior por bloco/campo
        // O runtime scratch-vm gerencia o edge por conta própria ao usar edgeActivated:true
    }

    static get EXTENSION_ID () {
        return 'mmNatureza';
    }

    getInfo () {
        return {
            id: Scratch3MMNaturezaBlocks.EXTENSION_ID,
            name: formatMessage({
                id: 'mmNatureza.categoryName',
                default: 'Natureza',
                description: 'Nome da categoria de blocos de eventos naturais WebRTC'
            }),
            color1: '#28a745',
            color2: '#1e7e34',
            color3: '#155724',
            blocks: [
                // ── Eventos (HAT) ───────────────────────────────────────────
                {
                    opcode: 'quandoAmanhecer',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'mmNatureza.quandoAmanhecer',
                        default: 'quando amanhecer',
                        description: 'Dispara quando o dia começa (ehDia passa de false para true)'
                    }),
                    isEdgeActivated: true
                },
                {
                    opcode: 'quandoAnoitecer',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'mmNatureza.quandoAnoitecer',
                        default: 'quando anoitecer',
                        description: 'Dispara quando a noite começa (ehDia passa de true para false)'
                    }),
                    isEdgeActivated: true
                },
                {
                    opcode: 'quandoTempoFor',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'mmNatureza.quandoTempoFor',
                        default: 'quando tempo estiver [CLIMA]',
                        description: 'Dispara quando o clima muda para o valor especificado'
                    }),
                    isEdgeActivated: true,
                    arguments: {
                        CLIMA: {
                            type: ArgumentType.STRING,
                            menu: 'climaOpcoes',
                            defaultValue: 'LIMPO'
                        }
                    }
                },
                {
                    opcode: 'quandoTemperaturaFor',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'mmNatureza.quandoTemperaturaFor',
                        default: 'quando temperatura estiver [TEMP]',
                        description: 'Dispara quando a temperatura muda para o valor especificado'
                    }),
                    isEdgeActivated: true,
                    arguments: {
                        TEMP: {
                            type: ArgumentType.STRING,
                            menu: 'tempOpcoes',
                            defaultValue: '2'
                        }
                    }
                },
                {
                    opcode: 'quandoForHora',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'mmNatureza.quandoForHora',
                        default: 'quando for [HORA] h',
                        description: 'Dispara quando a hora chega ao valor especificado'
                    }),
                    isEdgeActivated: true,
                    arguments: {
                        HORA: {
                            type: ArgumentType.STRING,
                            menu: 'horaOpcoes',
                            defaultValue: '6'
                        }
                    }
                },
                '---',
                // ── Sensores (BOOLEAN) ──────────────────────────────────────
                {
                    opcode: 'ehDia',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'mmNatureza.ehDia',
                        default: 'for dia',
                        description: 'Verdadeiro se for dia no simulador'
                    })
                },
                {
                    opcode: 'climaEh',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'mmNatureza.climaEh',
                        default: 'tempo estiver [CLIMA]',
                        description: 'Verdadeiro se o clima atual for o especificado'
                    }),
                    arguments: {
                        CLIMA: {
                            type: ArgumentType.STRING,
                            menu: 'climaOpcoes',
                            defaultValue: 'LIMPO'
                        }
                    }
                },
                {
                    opcode: 'temperaturaEh',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'mmNatureza.temperaturaEh',
                        default: 'temperatura estiver [TEMP]',
                        description: 'Verdadeiro se a temperatura atual for a especificada'
                    }),
                    arguments: {
                        TEMP: {
                            type: ArgumentType.STRING,
                            menu: 'tempOpcoes',
                            defaultValue: '2'
                        }
                    }
                },
                {
                    opcode: 'estacaoEh',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'mmNatureza.estacaoEh',
                        default: 'estação for [ESTACAO]',
                        description: 'Verdadeiro se a estação atual for a especificada'
                    }),
                    arguments: {
                        ESTACAO: {
                            type: ArgumentType.STRING,
                            menu: 'estacaoOpcoes',
                            defaultValue: 'VERAO'
                        }
                    }
                },
                {
                    opcode: 'faseLuaEh',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'mmNatureza.faseLuaEh',
                        default: 'fase da lua for [LUA]',
                        description: 'Verdadeiro se a fase da lua atual for a especificada'
                    }),
                    arguments: {
                        LUA: {
                            type: ArgumentType.STRING,
                            menu: 'luaOpcoes',
                            defaultValue: 'NOVA'
                        }
                    }
                },
                {
                    opcode: 'diaSemanaEh',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'mmNatureza.diaSemanaEh',
                        default: 'dia da semana for [DIA]',
                        description: 'Verdadeiro se o dia da semana atual for o especificado'
                    }),
                    arguments: {
                        DIA: {
                            type: ArgumentType.STRING,
                            menu: 'diaSemanaOpcoes',
                            defaultValue: '0'
                        }
                    }
                },
                '---',
                // ── Sensores (REPORTER) ─────────────────────────────────────
                {
                    opcode: 'horaAtual',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'mmNatureza.horaAtual',
                        default: 'hora atual',
                        description: 'Retorna a hora atual do simulador (0-23)'
                    })
                },
                {
                    opcode: 'diaMesAtual',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'mmNatureza.diaMesAtual',
                        default: 'dia do mês',
                        description: 'Retorna o dia do mês atual do simulador (1-31)'
                    })
                },
                {
                    opcode: 'mesAtual',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'mmNatureza.mesAtual',
                        default: 'mês',
                        description: 'Retorna o mês atual do simulador (1-12)'
                    })
                },
                {
                    opcode: 'anoAtual',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'mmNatureza.anoAtual',
                        default: 'ano',
                        description: 'Retorna o ano atual do simulador (formato 2 dígitos)'
                    })
                },
                {
                    opcode: 'climaAtual',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'mmNatureza.climaAtual',
                        default: 'clima',
                        description: 'Retorna o clima atual do simulador'
                    })
                },
                {
                    opcode: 'temperaturaAtual',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'mmNatureza.temperaturaAtual',
                        default: 'temperatura',
                        description: 'Retorna a temperatura atual do simulador (FRIO/FRESCO/MORNO/QUENTE)'
                    })
                },
                {
                    opcode: 'estacaoAtual',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'mmNatureza.estacaoAtual',
                        default: 'estação do ano',
                        description: 'Retorna a estação do ano atual do simulador'
                    })
                },
                '---',
                // ── Comunicação remota ──────────────────────────────────────
                {
                    opcode: 'transmitaMsgRemota',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'mmNatureza.transmitaMsgRemota',
                        default: 'transmita msg remota [COD_MSG]',
                        description: 'Transmite uma mensagem remota via WebRTC para todos os peers da equipe'
                    }),
                    arguments: {
                        COD_MSG: {
                            type: ArgumentType.STRING,
                            defaultValue: 'codMsg'
                        }
                    }
                },
                {
                    opcode: 'quandoReceberMsgRemota',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'mmNatureza.quandoReceberMsgRemota',
                        default: 'quando receber msg remota [COD_MSG]',
                        description: 'Dispara quando uma mensagem remota com o código especificado é recebida via WebRTC'
                    }),
                    isEdgeActivated: true,
                    arguments: {
                        COD_MSG: {
                            type: ArgumentType.STRING,
                            defaultValue: 'codMsg'
                        }
                    }
                }
            ],
            menus: {
                climaOpcoes: {
                    acceptReporters: true,
                    items: CLIMA_OPCOES
                },
                tempOpcoes: {
                    acceptReporters: true,
                    items: TEMP_OPCOES
                },
                estacaoOpcoes: {
                    acceptReporters: true,
                    items: ESTACAO_OPCOES
                },
                luaOpcoes: {
                    acceptReporters: true,
                    items: LUA_OPCOES
                },
                diaSemanaOpcoes: {
                    acceptReporters: true,
                    items: DIA_SEMANA_OPCOES
                },
                horaOpcoes: {
                    acceptReporters: true,
                    items: HORA_OPCOES
                }
            }
        };
    }

    // ── HAT predicates ────────────────────────────────────────────────────

    quandoAmanhecer () {
        return getEhDia();
    }

    quandoAnoitecer () {
        return !getEhDia();
    }

    quandoTempoFor (args) {
        return getClima() === String(args.CLIMA);
    }

    quandoTemperaturaFor (args) {
        return getTemperatura() === Number(args.TEMP);
    }

    quandoForHora (args) {
        return getHora() === Number(args.HORA);
    }

    // ── BOOLEAN blocks ────────────────────────────────────────────────────

    ehDia () {
        return getEhDia();
    }

    climaEh (args) {
        return getClima() === String(args.CLIMA);
    }

    temperaturaEh (args) {
        return getTemperatura() === Number(args.TEMP);
    }

    estacaoEh (args) {
        return getEstacao() === String(args.ESTACAO);
    }

    faseLuaEh (args) {
        return getFaseLua() === String(args.LUA);
    }

    diaSemanaEh (args) {
        return getDiaSemana() === Number(args.DIA);
    }

    // ── REPORTER blocks ───────────────────────────────────────────────────

    horaAtual () {
        return getHora();
    }

    diaMesAtual () {
        return getDiaMes();
    }

    mesAtual () {
        return getMes();
    }

    anoAtual () {
        return getAno();
    }

    climaAtual () {
        const c = getClima();
        if (c === 'LIMPO') return 'bom';
        if (c === 'CHUVOSO') return 'chuvoso';
        if (c === 'NUBLADO') return 'nublado';
        return c;
    }

    temperaturaAtual () {
        const t = getTemperatura();
        if (t === 0) return 'FRIO';
        if (t === 1) return 'FRESCO';
        if (t === 2) return 'MORNO';
        if (t === 3) return 'QUENTE';
        return String(t);
    }

    estacaoAtual () {
        return getEstacao();
    }

    // ── Comunicação remota ────────────────────────────────────────────────

    transmitaMsgRemota (args) {
        const codMsg = String(args.COD_MSG ?? '').trim().substring(0, 50);
        if (!codMsg) return;
        if (typeof window !== 'undefined' && typeof window.mmTransmitirMsgRemota === 'function') {
            window.mmTransmitirMsgRemota(codMsg);
        }
    }

    quandoReceberMsgRemota (args) {
        const codMsg = String(args.COD_MSG ?? '').trim();
        if (!codMsg) return false;
        if (typeof window === 'undefined') return false;
        const cache = window.mmEventosRecebidosWebRTC;
        if (!(cache instanceof Map)) return false;
        if (cache.has(codMsg)) {
            cache.delete(codMsg);
            return true;
        }
        return false;
    }
}

module.exports = Scratch3MMNaturezaBlocks;
