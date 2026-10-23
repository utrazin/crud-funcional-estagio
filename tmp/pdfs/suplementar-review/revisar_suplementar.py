from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).with_name("deps")))
import fitz


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "documentos/Especificação Suplementar/Especificação-Suplementar-Enzo-Dutra.pdf"
OUTPUT = ROOT / "documentos/Especificação Suplementar/Especificação-Suplementar-Enzo-Dutra-Revisada.pdf"
ARIAL = "C:/Windows/Fonts/arial.ttf"
BOLD = "C:/Windows/Fonts/arialbd.ttf"

doc = fitz.open(SOURCE)


def width(text, size, bold=False):
    font = fitz.Font(fontfile=BOLD if bold else ARIAL)
    return font.text_length(text, fontsize=size)


def wrap(text, size, max_width, bold=False):
    lines = []
    for paragraph in text.split("\n"):
        line = ""
        for word in paragraph.split():
            next_line = word if not line else line + " " + word
            if width(next_line, size, bold) <= max_width:
                line = next_line
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
    return lines


def block(page_num, rect, text, *, x, baseline, size=10, leading=12, max_width=440, max_lines=None, bold=False):
    page = doc[page_num - 1]
    page.add_redact_annot(fitz.Rect(*rect), fill=(1, 1, 1), cross_out=False)
    lines = wrap(text, size, max_width, bold)
    if max_lines is not None and len(lines) > max_lines:
        raise ValueError(f"Página {page_num}: {len(lines)} linhas excedem {max_lines}: {lines}")
    pending.append((page_num, lines, x, baseline, size, leading, bold))


pending = []

# Título e cabeçalhos: manter margens, tipo, tamanho e datas originais.
block(1, (90, 87, 553, 113), "Sistema de Controle de Estoque e Vendas",
      x=0, baseline=107.84, size=18, max_width=453, max_lines=1, bold=True)
for page_num in range(2, 9):
    block(page_num, (95, 69, 340, 82), "Sistema de Controle de Estoque e Vendas",
          x=95.75, baseline=79.16, size=10, max_width=285, max_lines=1)
block(3, (74, 485, 485, 500),
      "8. Requisitos de Sistema de Ajuda e de Documentação de Usuário On-line 7",
      x=74.75, baseline=496.11, size=11, max_width=445, max_lines=1, bold=True)

# Pág. 4 — finalidade e funções efetivas.
block(4, (107, 258, 519, 273),
      "de Controle de Estoque e Vendas de Perfumes, considerando a visão técnica do",
      x=107.8, baseline=269.5, max_width=410, max_lines=1)
block(4, (107, 299, 515, 314),
      "registro de vendas e consulta ao faturamento do negócio.",
      x=107.8, baseline=309, max_width=410, max_lines=1)
block(4, (107, 617, 553, 715),
      "Todo sistema possui requisitos funcionais que definem suas operações principais. No Sistema de Controle de Estoque e Vendas, as funcionalidades incluem: cadastro, edição, exclusão e consulta de produtos e clientes; verificação da disponibilidade em estoque; registro, edição e cancelamento de vendas vinculadas a produtos e clientes; atualização automática do estoque; e relatórios de vendas com filtros por período, produto e cliente, faturamento e indicadores de vendas. Essas funcionalidades estão representadas nos Casos de Uso e Diagramas de Caso de Uso do sistema.",
      x=109.2, baseline=627.4, max_width=420, max_lines=7)

# Pág. 5 — usabilidade e integridade.
block(5, (108, 262, 545, 311),
      "O sistema foi projetado para ser simples e intuitivo, considerando que o usuário possui conhecimentos básicos de informática. A interface facilita o cadastro de produtos e clientes, a consulta do estoque, o registro de vendas e a visualização de relatórios, reduzindo a complexidade da navegação.",
      x=109.2, baseline=271, max_width=420, max_lines=4)
block(5, (108, 426, 523, 451),
      "Os dados registrados no sistema, como produtos, clientes e vendas, devem ser armazenados com segurança para evitar perdas ou alterações indevidas.",
      x=109.2, baseline=435, max_width=420, max_lines=2)

# Pág. 6 — navegadores e dados persistidos.
block(6, (108, 250, 510, 277),
      "O sistema deve funcionar em navegadores modernos, como Google Chrome, Mozilla Firefox e Microsoft Edge.",
      x=109.2, baseline=260, max_width=410, max_lines=2)
block(6, (108, 423, 510, 437),
      "vendas, clientes e relatórios do sistema.",
      x=108.5, baseline=433, max_width=410, max_lines=1)

# Pág. 7 — manual entregue, licenças e funções acessíveis.
block(7, (72, 247, 553, 309),
      "8. Requisitos de Sistema de Ajuda e de Documentação de Usuário On-line",
      x=73.2, baseline=258.4, size=12, max_width=432, max_lines=1, bold=True)
block(7, (108, 327, 530, 365),
      "O sistema utiliza bibliotecas e ferramentas de uso livre ou open source. Eventuais custos de hospedagem da aplicação e do banco de dados dependem dos serviços contratados.",
      x=109.2, baseline=336, max_width=420, max_lines=3)
block(7, (119, 469, 527, 520),
      "- Cadastro e consulta de produtos e estoque\n- Cadastro e consulta de clientes\n- Registro e acompanhamento de vendas\n- Consulta de relatórios de vendas e faturamento",
      x=120.5, baseline=479, max_width=400, max_lines=4)
block(7, (108, 563, 542, 613),
      "Para utilizar o sistema, o usuário precisa de um dispositivo com acesso à internet e navegador web moderno, como Google Chrome, Mozilla Firefox ou Microsoft Edge. Não é necessário hardware avançado.",
      x=109.2, baseline=572, max_width=420, max_lines=4)

# Pág. 8 — comunicação e licenças.
block(8, (106, 286, 532, 325),
      "A comunicação entre o navegador do usuário e o sistema ocorre por requisições web entre o frontend e o backend para envio e recebimento de dados.",
      x=108.5, baseline=296, max_width=420, max_lines=3)
block(8, (108, 346, 529, 373),
      "O uso do sistema não exige licença específica. As bibliotecas empregadas possuem licenças próprias, e a hospedagem pode gerar custos conforme o serviço contratado.",
      x=109.2, baseline=356, max_width=420, max_lines=2)

# A seção 8 precisava de título e parágrafo separados. O texto vem depois das redações.
pending.append((7, wrap("Para auxiliar o usuário, foi criado o Manual-de-Uso-StockFinance.pdf. Ele orienta o cadastro de produtos e clientes, o controle de estoque, o registro de vendas, a consulta de relatórios e o uso de arquivos CSV.", 10, 440), 107, 275, 10, 13.5, False))

# O código não define um limiar de 10 segundos nem identifica o provedor do banco.
block(6, (108, 162, 489, 200),
      "O sistema deve responder às ações do usuário em tempo adequado. Se uma operação apresentar lentidão persistente, a conexão, o servidor e o banco de dados devem ser verificados.",
      x=109.2, baseline=171.5, max_width=410, max_lines=3)
block(8, (108, 224, 492, 237),
      "Conexão com PostgreSQL configurada no backend por variável de ambiente.",
      x=109.2, baseline=234, max_width=410, max_lines=1)

for page in doc:
    page.apply_redactions(images=0, graphics=0, text=0)
    page.insert_font(fontname="ArialNovo", fontfile=ARIAL)
    page.insert_font(fontname="ArialNovoBold", fontfile=BOLD)

for page_num, lines, x, baseline, size, leading, bold in pending:
    page = doc[page_num - 1]
    fontname = "ArialNovoBold" if bold else "ArialNovo"
    for idx, line in enumerate(lines):
        if page_num == 1 and baseline == 107.84:
            x_line = 555.9 - width(line, size, bold)
        else:
            x_line = x
        page.insert_text((x_line, baseline + idx * leading), line,
                         fontname=fontname, fontsize=size, color=(0, 0, 0))

doc.save(OUTPUT, garbage=4, deflate=True)
print(OUTPUT)
