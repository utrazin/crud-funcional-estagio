from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate


ROOT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = ROOT / "documentos/Manual de Uso"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT = OUTPUT_DIR / "Manual-de-Uso-StockFinance.pdf"

pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")

NAVY = colors.HexColor("#172738")
GRAY = colors.HexColor("#425466")
BLUE = colors.HexColor("#1D5F9A")

styles = {
    "title": ParagraphStyle("Title", fontName="Arial-Bold", fontSize=18, leading=22, textColor=NAVY, spaceAfter=10),
    "intro": ParagraphStyle("Intro", fontName="Arial", fontSize=9.7, leading=14, textColor=GRAY, spaceAfter=14),
    "heading": ParagraphStyle("Heading", fontName="Arial-Bold", fontSize=11.4, leading=15, textColor=BLUE, spaceBefore=10, spaceAfter=5),
    "body": ParagraphStyle("Body", fontName="Arial", fontSize=9.7, leading=14, textColor=NAVY, spaceAfter=5, alignment=TA_LEFT),
    "note": ParagraphStyle("Note", fontName="Arial", fontSize=9.3, leading=13.4, textColor=GRAY, leftIndent=9, spaceBefore=5, spaceAfter=7),
}


def header_footer(canvas, doc):
    width, height = letter
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.setFont("Arial-Bold", 11)
    canvas.drawString(58, height - 46, "StockFinance")
    canvas.setFont("Arial", 9)
    canvas.drawRightString(width - 58, height - 45, "Manual de uso")
    canvas.setStrokeColor(colors.HexColor("#C9D3DD"))
    canvas.setLineWidth(0.6)
    canvas.line(58, height - 56, width - 58, height - 56)
    canvas.setFont("Arial", 8)
    canvas.setFillColor(GRAY)
    canvas.drawCentredString(width / 2, 40, f"Página {doc.page}")
    canvas.restoreState()


def section(story, title, paragraphs):
    flowables = [Paragraph(title, styles["heading"])]
    flowables.extend(Paragraph(text, styles["body"]) for text in paragraphs)
    story.append(KeepTogether(flowables))


story = [
    Paragraph("Manual de uso", styles["title"]),
    Paragraph("Guia rápido para o proprietário usar as funções do sistema de estoque, clientes, vendas e relatórios.", styles["intro"]),
]

section(story, "1. Entrar e navegar", [
    "Abra o endereço do StockFinance no navegador. Informe seu e-mail e sua senha e clique em <b>Entrar</b>. O menu lateral leva a <b>Produtos</b>, <b>Clientes</b>, <b>Vendas</b> e <b>Relatórios Financeiros</b>.",
    "Ao terminar, clique em <b>Sair</b> no menu lateral. O botão <b>Tema</b> alterna entre aparência clara e escura.",
])

section(story, "2. Produtos e estoque", [
    "Em <b>Produtos</b>, use <b>Buscar produto</b> para localizar um item. A lista mostra o nome, a quantidade disponível e o preço de custo cadastrado.",
    "Para incluir um produto, clique em <b>Adicionar</b>, preencha nome, quantidade em estoque e preço de custo unitário; a descrição é opcional. Clique em <b>Salvar</b>.",
    "Use os ícones da linha para <b>editar</b>, <b>ver detalhes</b> ou <b>excluir</b>. Quando receber mais unidades, abra <b>Editar Produto</b> e atualize a quantidade em estoque. Os detalhes mostram o histórico de vendas do produto.",
])

section(story, "3. Clientes", [
    "Em <b>Clientes</b>, clique em <b>Adicionar</b>, informe o nome e, se quiser, o telefone; depois clique em <b>Cadastrar</b>. A busca localiza clientes pelo nome.",
    "O ícone de detalhes mostra telefone, compras, produtos comprados, valor gasto e histórico. Nessa tela também é possível <b>editar</b> ou <b>excluir</b> o cliente.",
])

story.append(PageBreak())

section(story, "4. Registrar uma venda", [
    "Depois de receber o pagamento, vá a <b>Produtos</b>, encontre o produto e clique em <b>Vender</b>. O botão fica indisponível quando o estoque está zerado.",
    "Selecione um cliente da lista ou digite o nome de um novo comprador; nesse caso, o sistema o cadastra ao registrar a venda. Informe <b>quantidade</b>, <b>valor da venda por unidade</b> e <b>data</b>. Confira o valor total e clique em <b>Registrar</b>. Para vender uma unidade e manter a janela aberta, use <b>Vender +1</b>.",
    "Ao registrar, a venda aparece no histórico e a quantidade vendida é descontada do estoque. O sistema não registra o recebimento do pagamento nem pedidos ao fornecedor.",
])

section(story, "5. Consultar, editar ou cancelar vendas", [
    "Em <b>Vendas</b>, pesquise pelo produto ou cliente. O ícone de lápis permite corrigir cliente, quantidade, valor ou data; clique em <b>Salvar</b> para confirmar.",
    "Para cancelar, clique no ícone <b>X</b> da venda e confirme. O estoque é restaurado e os totais do cliente são corrigidos. O cancelamento não pode ser desfeito pela interface.",
])

section(story, "6. Relatórios e arquivos CSV", [
    "Em <b>Relatórios Financeiros</b>, escolha o período e, se necessário, filtre por produto ou cliente. Clique em <b>Atualizar</b>. A página mostra vendas, produtos vendidos, clientes atendidos, ticket médio, faturamento e histórico.",
    "<b>Exportar CSV</b> baixa as vendas dos filtros escolhidos. <b>Importar CSV</b> lê vendas de um arquivo com as colunas Produto, Cliente, Quantidade, Valor Unitário e Data. Antes de importar, cadastre os produtos e confira o estoque; o sistema informa as linhas que não conseguiu importar.",
])

story.append(Paragraph("<b>Importante:</b> faturamento é a soma dos valores das vendas. O sistema não calcula lucro nem registra despesas. Se faltar estoque, atualize a quantidade do produto após receber as unidades.", styles["note"]))

doc = SimpleDocTemplate(
    str(OUTPUT), pagesize=letter, leftMargin=58, rightMargin=58,
    topMargin=76, bottomMargin=58, title="Manual de uso do StockFinance",
    author="Projeto StockFinance",
)
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(OUTPUT)
