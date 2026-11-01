#!/usr/bin/env python3
"""
Script utilitário para extração, unificação e higienização da base de CEPs via API pública ViaCEP.
Uso:
  python scripts/coletar_ceps.py               # Usa "Carangola" por padrão
  python scripts/coletar_ceps.py "Divinópolis" # Gera data/ceps.json para outra cidade de MG
"""

import json
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

UF = "MG"
CIDADE_PADRAO = "Carangola"
TIPOS_LOGRADOURO = ["Rua", "Avenida", "Praca"]


def normalizar_chave(texto: str) -> str:
    texto_nfd = unicodedata.normalize("NFD", (texto or "").strip().lower())
    return "".join(ch for ch in texto_nfd if unicodedata.category(ch) != "Mn")


def coletar_ceps(cidade: str) -> list[dict]:
    cidade_encoded = urllib.parse.quote(cidade.strip())
    registros_unicos: dict[tuple[str, str, str, str, str], dict] = {}

    for tipo in TIPOS_LOGRADOURO:
        url = f"https://viacep.com.br/ws/{UF}/{cidade_encoded}/{tipo}/json/"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (UEMG-SI-ConsultaCEPs/1.0)"},
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                dados = json.loads(response.read().decode("utf-8"))
                if not isinstance(dados, list):
                    print(f"[AVISO] Resposta inesperada para '{tipo}': {dados}")
                    continue

                novos = 0
                for item in dados:
                    cep = (item.get("cep") or "").strip()
                    logradouro = (item.get("logradouro") or "").strip()
                    complemento = (item.get("complemento") or "").strip()
                    unidade = (item.get("unidade") or "").strip()
                    bairro = (item.get("bairro") or "").strip()

                    if not cep or not logradouro:
                        continue

                    chave = (
                        cep,
                        normalizar_chave(logradouro),
                        normalizar_chave(complemento),
                        normalizar_chave(unidade),
                        normalizar_chave(bairro),
                    )
                    if chave not in registros_unicos:
                        registros_unicos[chave] = {
                            "cep": cep,
                            "logradouro": logradouro,
                            "complemento": complemento,
                            "unidade": unidade,
                            "bairro": bairro,
                            "localidade": (item.get("localidade") or cidade).strip(),
                            "uf": (item.get("uf") or UF).strip(),
                        }
                        novos += 1

                print(f"[OK] {tipo}: {len(dados)} retornados ({novos} únicos adicionados)")
        except Exception as erro:
            print(f"[ERRO] Falha ao consultar '{tipo}' em {url}: {erro}")

    lista_ordenada = sorted(
        registros_unicos.values(),
        key=lambda reg: (normalizar_chave(reg["logradouro"]), reg["cep"]),
    )
    return lista_ordenada


def main() -> None:
    cidade = sys.argv[1] if len(sys.argv) > 1 else CIDADE_PADRAO
    print(f"Iniciando coleta ViaCEP para {cidade}/{UF}...")

    dados_finais = coletar_ceps(cidade)
    if not dados_finais:
        print(
            "\n[ATENÇÃO] Nenhum logradouro retornado! Verifique se a cidade possui CEPs por logradouro no ViaCEP."
        )
        sys.exit(1)

    raiz_projeto = Path(__file__).resolve().parent.parent
    caminho_saida = raiz_projeto / "data" / "ceps.json"
    caminho_saida.parent.mkdir(parents=True, exist_ok=True)

    with caminho_saida.open("w", encoding="utf-8") as arquivo:
        json.dump(dados_finais, arquivo, ensure_ascii=False, indent=2)
        arquivo.write("\n")

    print(f"\nConcluído! {len(dados_finais)} logradouros consolidados salvos em: {caminho_saida}")


if __name__ == "__main__":
    main()
