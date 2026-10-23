from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "suplementar-review" / "deps"))
import fitz


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "documentos/Documento de Visão/Documento-De-Visao-Enzo-Dutra.pdf"
OUTPUT = ROOT / "documentos/Documento de Visão/Documento-De-Visao-Enzo-Dutra-Revisado.pdf"
ARIAL = "C:/Windows/Fonts/arial.ttf"
BOLD = "C:/Windows/Fonts/arialbd.ttf"
doc = fitz.open(SOURCE)
font_normal = fitz.Font(fontfile=ARIAL)
font_bold = fitz.Font(fontfile=BOLD)
pending = []


def text_width(text, size, bold=False):
    return (font_bold if bold else font_normal).text_length(text, fontsize=size)


def wrap(text, size, max_width, bold=False):
    result = []
    for paragraph in text.split("\n"):
        line = ""
        for word in paragraph.split():
            candidate = f"{line} {word}" if line else word
            if text_width(candidate, size, bold) <= max_width:
                line = candidate
            else:
                if line:
                    result.append(line)
                line = word
        if line:
            result.append(line)
    return result


def block(page_num, rect, text, *, x, baseline, size=11, leading=15, max_width=445, max_lines=None, bold=False, right_edge=None):
    lines = wrap(text, size, max_width, bold)
    if max_lines is not None and len(lines) > max_lines:
        raise ValueError(f"Página {page_num}: {len(lines)} linhas, máximo {max_lines}: {lines}")
    doc[page_num - 1].add_redact_annot(fitz.Rect(*rect), fill=(1, 1, 1), cross_out=False)
    pending.append((page_num, lines, x, baseline, size, leading, bold, right_edge))


def exact_lines(page_num, rect, lines, *, x, baselines, size=11):
    if len(lines) != len(baselines):
        raise ValueError("Quantidade de linhas e posições diferente")
    doc[page_num - 1].add_redact_annot(fitz.Rect(*rect), fill=(1, 1, 1), cross_out=False)
    for line, baseline in zip(lines, baselines):
        pending.append((page_num, [line], x, baseline, size, 0, False, None))


# Título da capa alinhado à margem direita do original; cabeçalho repetido.
block(1, (74, 79, 552, 99), "Sistema de Controle de Estoque e Vendas",
      x=0, baseline=93.9, size=15, max_width=475, max_lines=1, bold=True, right_edge=550.2)
for page_num in range(2, 9):
    page = doc[page_num - 1]
    header_span = next(
        s for b in page.get_text("dict")["blocks"] if "lines" in b
        for line in b["lines"] for s in line["spans"]
        if "Sistema de Controle de Estoque e Gestão Financeira de Perfumes" in s["text"]
        and s["bbox"][1] < 65
    )
    x0, y0, x1, y1 = header_span["bbox"]
    block(page_num, (x0 - .4, y0 - .5, x1 + .4, y1 + .5),
          "Sistema de Controle de Estoque e Vendas",
          x=x0, baseline=header_span["origin"][1], size=10, max_width=305, max_lines=1)
    subheader_span = next(
        s for b in page.get_text("dict")["blocks"] if "lines" in b
        for line in b["lines"] for s in line["spans"]
        if s["text"].startswith("Documento Visão") and s["bbox"][1] < 95
    )
    x0, y0, x1, y1 = subheader_span["bbox"]
    block(page_num, (x0 - .4, y0 - .5, x1 + .4, y1 + .5),
          "Documento de Visão", x=x0, baseline=subheader_span["origin"][1],
          size=10, max_width=120, max_lines=1)

block(3, (59, 208, 175, 223), "2. Posicionamento 5",
      x=60, baseline=218.97, size=11, max_width=135, max_lines=1, bold=True)
block(3, (59, 248, 221, 263), "3. Descrições do Envolvido 6",
      x=60, baseline=259.47, size=11, max_width=165, max_lines=1, bold=True)

# Pág. 4 — propósito e situação atual descrita pelo investidor.
block(4, (100, 221, 555, 312),
      "Este documento apresenta as necessidades e os requisitos do Sistema de Controle de Estoque e Vendas, uma aplicação web para o proprietário do negócio de perfumes. A solução reúne cadastro de produtos e clientes, consulta do estoque, registro de vendas e relatórios de vendas e faturamento. Seu objetivo é organizar as informações e facilitar o acompanhamento da atividade.",
      x=102, baseline=232.66, leading=18.75, max_width=447, max_lines=5)
block(4, (100, 329, 545, 438),
      "Atualmente, produtos e vendas são controlados por anotações manuais e registros separados. Isso dificulta consultar o estoque, recuperar o histórico de vendas e acompanhar o faturamento, além de aumentar o risco de erros. O Documento de Visão orienta o desenvolvimento do sistema e pode ser atualizado conforme novas necessidades sejam identificadas.",
      x=101.25, baseline=340.79, leading=18.75, max_width=440, max_lines=6)

# Pág. 5 — posicionamento, problema e benefícios.
block(5, (61, 141, 536, 184),
      "O sistema centraliza o controle hoje feito por anotações manuais e registros separados. Ele organiza, em um só lugar, produtos, clientes, estoque, vendas e informações de faturamento.",
      x=93, baseline=151.93, leading=13.5, max_width=440, max_lines=3)
block(5, (100, 194, 553, 249),
      "A proposta é oferecer uma ferramenta simples e rápida para um pequeno negócio de perfumes, permitindo ao proprietário acompanhar o estoque, o histórico de clientes e os resultados das vendas.",
      x=102, baseline=205.82, leading=18.75, max_width=447, max_lines=3)
block(5, (115, 300, 510, 343),
      "Atualmente, o controle de estoque e vendas de perfumes é feito com anotações manuais e registros separados, o que gera dificuldades operacionais.",
      x=117, baseline=311.67, leading=13.5, max_width=390, max_lines=3)
block(5, (120, 437, 430, 452),
      "- Maior possibilidade de erros nos registros de vendas",
      x=120.75, baseline=447.72, max_width=310, max_lines=1)
block(5, (115, 479, 557, 525),
      "Para resolver esses problemas, o Sistema de Controle de Estoque e Vendas reunirá as informações do negócio em um único ambiente web.",
      x=117, baseline=490.85, leading=15, max_width=435, max_lines=3)
exact_lines(5, (119, 552, 500, 643), [
    "- Cadastre produtos e consulte a disponibilidade em estoque",
    "- Cadastre e consulte clientes",
    "- Registre e acompanhe as vendas realizadas",
    "- Atualize o estoque automaticamente após cada venda",
    "- Consulte relatórios de vendas, faturamento e histórico",
], x=120, baselines=[562.89, 582.64, 601.47, 620.22, 638.97])

# Pág. 6 — responsabilidades do proprietário e visão geral.
block(6, (311, 231, 487, 305),
      "Cadastra produtos e clientes, registra vendas, acompanha o estoque e consulta relatórios de faturamento.",
      x=324.75, baseline=242.31, leading=19.4, max_width=158, max_lines=4)
block(6, (100, 548, 551, 601),
      "O Sistema de Controle de Estoque e Vendas é uma aplicação web para organizar as atividades de venda de perfumes, incluindo produtos, clientes e disponibilidade em estoque.",
      x=102, baseline=559.62, leading=18.75, max_width=445, max_lines=3)
block(6, (100, 619, 545, 654),
      "O sistema permite registrar vendas, atualizar o estoque e consultar relatórios de vendas e faturamento.",
      x=102.75, baseline=630.22, leading=19.3, max_width=440, max_lines=2)

# Pág. 7 — conjunto de funções implementadas e tecnologia comprovada no código.
exact_lines(7, (83, 139, 480, 221), [
    "- Cadastro e gestão de produtos e clientes",
    "- Consulta da disponibilidade em estoque",
    "- Registro, edição e cancelamento de vendas",
    "- Atualização automática do estoque",
    "- Relatórios com filtros por período, produto e cliente",
    "- Faturamento e importação/exportação de arquivos CSV",
], x=84, baselines=[149.89, 163.47, 176.97, 190.47, 203.97, 217.47])
block(7, (101, 378, 505, 408),
      "PostgreSQL como banco de dados relacional, com a conexão configurada no backend por variável de ambiente.",
      x=102.75, baseline=389.23, leading=15.08, max_width=395, max_lines=2)

# Pág. 8 — requisitos que correspondem às telas e aos serviços existentes.
exact_lines(8, (119, 501, 513, 576), [
    "- Cadastrar, editar, consultar e excluir produtos e clientes",
    "- Registrar, editar e cancelar vendas vinculadas a clientes",
    "- Atualizar o estoque após registrar ou cancelar uma venda",
    "- Consultar relatórios com filtros por período, produto e cliente",
    "- Exibir faturamento e indicadores; importar e exportar CSV",
], x=120, baselines=[511.85, 527.22, 542.22, 557.22, 572.22])

for page in doc:
    page.apply_redactions(images=0, graphics=0, text=0)
    page.insert_font(fontname="ArialNovo", fontfile=ARIAL)
    page.insert_font(fontname="ArialNovoBold", fontfile=BOLD)

for page_num, lines, x, baseline, size, leading, bold, right_edge in pending:
    page = doc[page_num - 1]
    fontname = "ArialNovoBold" if bold else "ArialNovo"
    for index, line in enumerate(lines):
        x_line = right_edge - text_width(line, size, bold) if right_edge is not None else x
        page.insert_text((x_line, baseline + index * leading), line,
                         fontname=fontname, fontsize=size, color=(0, 0, 0))

doc.save(OUTPUT, garbage=4, deflate=True)
print(OUTPUT)
