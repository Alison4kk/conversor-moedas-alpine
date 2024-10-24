function CambioUtil() {

  const taxaCambioCache = new Map();
  const moedasCache = [];

  return {
    async moedas() {
      if (moedasCache.length) {
        return moedasCache;
      }

      try {

        /**@type {Object.<string, string>} */
        const moedas = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json')
          .then(response => response.json());


        Object.entries(moedas).forEach(([chave, nome]) => {
          if (!nome || nome.includes('1')) return;
          moedasCache.push({ chave, nome });
        });

        console.log('Moedas atualizadas', moedasCache);
        return moedasCache;
      } catch (error) {
        console.error('Erro ao buscar moedas', error);
        return [];
      }
    },

    /**
     * @param {string} moedaOrigem 
     * @param {string} moedaDestino 
     */
    async taxaCambio(moedaOrigem, moedaDestino) {
      moedaOrigem = moedaOrigem.toLowerCase();
      moedaDestino = moedaDestino.toLowerCase();

      if (taxaCambioCache.has(moedaOrigem)) {
        return taxaCambioCache.get(moedaOrigem)[moedaDestino] ?? 0;
      }

      try {
        const json = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${moedaOrigem.toLowerCase()}.json`)
          .then(response => response.json());

        taxaCambioCache.set(moedaOrigem, json[moedaOrigem]);
        
        return json[moedaOrigem]?.[moedaDestino] ?? 0;
      } catch (error) {
        console.error('Erro ao buscar taxa de câmbio', error);
        return 0;
      }
    }
  }
}

//RF 5. Funções Puras e Imutabilidade:
/**
* @param {number} numero
* @returns {boolean}
*/
function numeroMaiorQueZero(numero) {
  return !isNaN(numero) && numero > 0;
}

/**
  * @param {number} valor 
  * @param {string} moeda 
  * @returns {string}
  */
function formatarValor(valor, moeda) {
  try {
    return Number(valor).toLocaleString('pt-br', { style: "currency", currency: String(moeda) });
  } catch {
    return Number(valor).toLocaleString('pt-br', { style: "decimal" });
  }
}

/**
* @param {any} valor
* @returns {boolean}
*/
function ehVerdadeiro(valor) {
  return !!valor;
}


//RF 2. Taxa de Câmbio e 3. Conversão de Moeda:
/**
* @param {number} valor
* @param {number} taxaCambio
* @returns {number}
*/
function converterValorTaxaCambio(valor, taxaCambio) {
  return valor * taxaCambio;
}



function conversorMoedasData() {
  return {
    valor: null,
    taxaCambio: 0,
    moedaOrigem: 'BRL',
    moedaDestino: 'BRL',
    taxaCambioUtil: CambioUtil(),
    moedas: [
      {
        chave: 'BRL',
        nome: 'Real',
      },
      {
        chave: 'USD',
        nome: 'Dolar',
      },
      {
        chave: 'EUR',
        nome: 'Euro',
      }
    ],
    init() {
      this.$watch('moedaOrigem', this.aoAtualizarCampos.bind(this));
      this.$watch('moedaDestino', this.aoAtualizarCampos.bind(this));
      this.$watch('valor', this.aoAtualizarCampos.bind(this));

      this.aoAtualizarCampos();
      this.buscarMoedas();
    },
    aoAtualizarCampos() {
      this.definirMoedaDestinoValida();
      this.atualizarTaxaCambio();
    },
    async buscarMoedas() {
      this.moedas = await this.taxaCambioUtil.moedas();
    }
    ,
    async atualizarTaxaCambio() {
      this.taxaCambio = await this.taxaCambioUtil.taxaCambio(this.moedaOrigem, this.moedaDestino);
      console.log('Taxa de câmbio atualizada', this.taxaCambio);
    },
    definirMoedaDestinoValida() {
      if (this.moedaDestino == this.moedaOrigem) {
        this.moedaDestino = this.moedasDisponiveisDestino[0].id;
      }
    },
    /**
    * @param {string} moeda 
    * @returns {boolean}
    */
    moedaOrigemValida(moeda) {
      return this.moedas.some(moedaDisponivel => moedaDisponivel.chave === moeda);
    },
    // RF 4. Validação:
    /**
    * @param {number} valorOrigem
    * @param {number} taxaCambio 
    * @param {number} moedaOrigem 
    * @param {number} moedaDestino 
    * @returns {boolean}
    */
    validarInputs(valorOrigem, taxaCambio, moedaOrigem, moedaDestino) {
      // RF 6. Funções de Ordem Superior:
      return [
        [valorOrigem, taxaCambio].every(numeroMaiorQueZero),
        [moedaOrigem, moedaDestino].every(this.moedaOrigemValida.bind(this))
      ].every(ehVerdadeiro);
    },
    get valido() {
      return this.validarInputs(this.valor, this.taxaCambio, this.moedaOrigem, this.moedaDestino);
    },
    get valorFormatado() {
      if (!this.valido) return formatarValor(0, this.moedaOrigem);
      return formatarValor(this.valor, this.moedaOrigem);
    },
    get valorConvertido() {
      if (!this.valido) return 0;

      return converterValorTaxaCambio(this.valor, this.taxaCambio);
    },
    get valorConvertidoFormatado() {
      if (!this.valido) return formatarValor(0, this.moedaDestino);
      return formatarValor(this.valorConvertido, this.moedaDestino);
    },
    get moedasDisponiveisOrigem() {
      return this.moedas.map(moeda => ({ id: moeda.chave, nome: moeda.nome }));
    },
    get moedasDisponiveisDestino() {
      return this.moedasDisponiveisOrigem.filter(moeda => moeda.id !== this.moedaOrigem);
    }
  }
}

