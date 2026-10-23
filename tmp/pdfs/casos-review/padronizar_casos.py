from __future__ import annotations

from html import escape
from io import BytesIO
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "suplementar-review" / "deps"))
import fitz
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / "documentos/Especificação Caso de Uso"
pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"))
W, H = letter
BLACK = colors.black

BODY = ParagraphStyle("Body", fontName="Arial", fontSize=12, leading=20.8,
                      textColor=BLACK, alignment=TA_JUSTIFY, firstLineIndent=36)
BODY_PLAIN = ParagraphStyle("BodyPlain", parent=BODY, firstLineIndent=0)
INTRO = ParagraphStyle("Intro", fontName="Arial", fontSize=11, leading=16,
                       textColor=BLACK, alignment=TA_LEFT, firstLineIndent=28)
BULLET = ParagraphStyle("Bullet", fontName="Arial", fontSize=12, leading=18.5,
                        textColor=BLACK, alignment=TA_LEFT)


def at_top(top: float) -> float:
    return H - top


def write_line(c: Canvas, text: str, x: float, top: float,
               *, font="Arial", size=10, right=False, center=False):
    c.setFillColor(BLACK)
    c.setFont(font, size)
    draw = c.drawRightString if right else c.drawCentredString if center else c.drawString
    draw(x, at_top(top + size), text)


def draw_table(c: Canvas, x=65, top=274, w=479, row_h=23.3, divider=322):
    y_top = at_top(top)
    c.setStrokeColor(BLACK)
    c.setLineWidth(.75)
    c.rect(x, y_top - 2 * row_h, w, 2 * row_h, stroke=1, fill=0)
    c.line(x, y_top - row_h, x + w, y_top - row_h)
    c.line(x + divider, y_top, x + divider, y_top - 2 * row_h)


def draw_header(c: Canvas, title: str, date: str, page: int, cover=False):
    if cover:
        write_line(c, "StockFinance", 549, 76, font="Arial-Bold", size=18, right=True)
        write_line(c, "Sistema de Controle de", 549, 124, font="Arial-Bold", size=18, right=True)
        write_line(c, "Estoque e Gestão Financeira", 549, 145.5, font="Arial-Bold", size=18, right=True)
        write_line(c, "Especificação de Caso de Uso:", 549, 193.7, font="Arial-Bold", size=18, right=True)
        write_line(c, title, 549, 215.2, font="Arial-Bold", size=18, right=True)
        write_line(c, "Versão 1.0", 543, 258.2, font="Arial-Bold", size=14, right=True)
        table_top = 274
    else:
        write_line(c, "Versão 1.0", 539.3, 70.7, font="Arial-Bold", size=14, right=True)
        table_top = 87
    draw_table(c, top=table_top)
    write_line(c, "Sistema de Controle de Estoque e Gestão Financeira", 77.5,
               table_top + 6.5, size=10)
    write_line(c, "Versão: 1.0", 403.8, table_top + 6.5, size=10)
    write_line(c, f"Especificação de Caso de Uso: {title}", 78.2,
               table_top + 29.8, size=10)
    write_line(c, f"Data: {date}", 404.5, table_top + 29.8, size=10)
    write_line(c, f"Página {page}", 557, 718, size=10, right=True)


def draw_cover(c: Canvas, title: str, date: str):
    draw_header(c, title, date, 1, cover=True)
    write_line(c, "Histórico da Revisão", W / 2, 337.5,
               font="Arial-Bold", size=18, center=True)
    x, top, width = 65, 359, 479
    row_h = 23.4
    y_top = at_top(top)
    c.setLineWidth(.8)
    c.rect(x, y_top - row_h * 2, width, row_h * 2, stroke=1, fill=0)
    c.line(x, y_top - row_h, x + width, y_top - row_h)
    for offset in (116, 174, 362):
        c.line(x + offset, y_top, x + offset, y_top - row_h * 2)
    for label, cx in [("Data", 123), ("Versão", 210), ("Descrição", 344), ("Autor", 481)]:
        write_line(c, label, cx, top + 4.5, font="Arial-Bold", size=10, center=True)
    write_line(c, date, 70.5, top + 28, size=10)
    write_line(c, "1.0", 193.8, top + 28, size=10)
    write_line(c, "Elaboração do Documento", 251.5, top + 28, size=10)
    write_line(c, "Enzo Dutra", 438.2, top + 28, size=10)
    c.showPage()


def draw_index(c: Canvas, title: str, date: str, rows: list[tuple[str, int]]):
    draw_header(c, title, date, 2)
    write_line(c, "Índice", W / 2, 165, font="Arial-Bold", size=18, center=True)
    top = 198.4
    for label, page in rows:
        number, rest = label.split(" ", 1)
        write_line(c, number, 65.5, top, font="Arial-Bold", size=11)
        x = 65.5 + pdfmetrics.stringWidth(number, "Arial-Bold", 11) + 5
        write_line(c, f"{rest} {page}", x, top, size=11)
        top += 26.3
    if top > 696:
        raise ValueError(f"Índice ultrapassou a página: {top}")
    c.showPage()


class PageBody:
    def __init__(self, c: Canvas, title: str, date: str, page: int, start=147):
        self.c = c
        self.top = start
        draw_header(c, title, date, page)

    def gap(self, amount=13):
        self.top += amount

    def heading(self, text: str, level=1):
        x = 65.5 if level == 1 else 72.2
        size = 17 if level == 0 else 12
        write_line(self.c, text, x, self.top, font="Arial-Bold", size=size)
        self.top += size + (17 if level == 0 else 13)

    def para(self, text: str, *, intro=False, plain=False, gap=13):
        style = INTRO if intro else BODY_PLAIN if plain else BODY
        x = 65.5 if intro else 72.2
        width = 486.5 if intro else 486
        p = Paragraph(escape(text), style)
        _, height = p.wrap(width, 1000)
        p.drawOn(self.c, x, at_top(self.top + height))
        self.top += height + gap

    def bullet(self, text: str, gap=7):
        x = 108.2
        p = Paragraph(escape(text), BULLET)
        _, height = p.wrap(440, 1000)
        self.c.circle(x + 2.5, at_top(self.top + 7), 2.5, stroke=0, fill=1)
        p.drawOn(self.c, x + 11, at_top(self.top + height))
        self.top += max(18.5, height) + gap

    def bullets(self, entries: list[str], gap=7):
        for entry in entries:
            self.bullet(entry, gap=gap)

    def check(self):
        if self.top > 713:
            raise ValueError(f"Conteúdo invadiu o rodapé na página: topo final {self.top:.1f}")
        self.c.showPage()


def image_for_source(path: Path):
    source = fitz.open(path)
    xref = source[-1].get_images(full=True)[0][0]
    extracted = source.extract_image(xref)
    return ImageReader(BytesIO(extracted["image"]))


def draw_figure(c: Canvas, img: ImageReader, top: float, width: float):
    write_line(c, "Figura 1 - Caso de uso", W / 2, top,
               size=12, center=True)
    iw, ih = img.getSize()
    height = width * ih / iw
    x = (W - width) / 2
    image_top = top + 35
    c.drawImage(img, x, at_top(image_top + height), width=width, height=height,
                preserveAspectRatio=True, mask="auto")
    write_line(c, "Fonte: O Autor", W / 2, image_top + height + 16,
               size=12, center=True)
    if image_top + height + 40 > 709:
        raise ValueError("Figura ultrapassou a página")


CASES = [
    {
        "name": "clientes", "title": "suc_Gerenciar_Clientes", "date": "11/08/2026",
        "source": "rup_Especificacao-suc_Gerenciar_Clientes-Enzo-Dutra.pdf",
        "output": "rup_Especificacao-suc_Gerenciar_Clientes-Enzo-Dutra-Padronizado.pdf",
        "toc": [
            ("1. BREVE DESCRIÇÃO", 3), ("2. FLUXO BÁSICO DE EVENTOS", 3),
            ("3. FLUXOS ALTERNATIVOS", 4), ("3.1 Visualizar Clientes", 4),
            ("3.2 Cadastrar Cliente", 4), ("3.3 Editar Cliente", 4),
            ("3.4 Excluir Cliente (Soft Delete)", 5), ("3.5 Buscar Cliente", 5),
            ("3.6 Dados Inseridos Incorretamente", 5), ("3.7 Cliente Já Excluído", 6),
            ("3.8 Falha na Conexão com a Internet", 6), ("4. SUBFLUXOS", 6),
            ("5. CENÁRIO CHAVE", 6), ("6. CONDIÇÕES PRÉVIAS", 6),
            ("7. CONDIÇÕES POSTERIORES", 7), ("8. PONTOS DE EXTENSÃO", 7),
            ("9. REQUISITOS ESPECIAIS", 7), ("10. INFORMAÇÕES ADICIONAIS", 8),
        ],
        "brief": "O caso de uso suc_Gerenciar_Clientes tem como objetivo permitir o cadastro e gerenciamento dos clientes no sistema de controle de estoque e gestão financeira. A funcionalidade possibilita ao proprietário registrar novos clientes, atualizar seus dados, realizar buscas por nome e excluí-los de forma lógica (soft delete), mantendo o histórico de associações com as vendas registradas no sistema.",
        "basic": "O fluxo básico de eventos do caso de uso suc_Gerenciar_Clientes tem como objetivo realizar o gerenciamento correto dos clientes no sistema. Para utilização adequada da funcionalidade, é necessário possuir conexão com a internet e acesso autorizado ao sistema.",
        "basic_bullets": ["Acessar o módulo de clientes;", "Visualizar a listagem de clientes cadastrados;", "Selecionar a ação desejada: cadastrar, editar, buscar ou excluir;", "Informar os dados necessários para a operação;", "Confirmar a operação;", "O sistema valida e persiste as informações no banco de dados;", "O cliente passa a ser exibido (ou atualizado) na listagem do sistema."],
        "alternatives": [
            ("3.1 Visualizar Clientes:", ["Acessar o módulo de clientes;", "Visualizar a listagem de todos os clientes ativos cadastrados no sistema;", "Selecionar um cliente específico para visualizar seus detalhes."]),
            ("3.2 Cadastrar Cliente:", ["Acessar o módulo de clientes ou iniciar o cadastro durante o processo de venda;", "Informar o nome do cliente;", "Confirmar o cadastro;", "O sistema valida o preenchimento do campo nome (obrigatório);", "O cliente é criado e passa a ser exibido na listagem."]),
            ("3.3 Editar Cliente:", ["Selecionar um cliente ativo da listagem;", "Solicitar edição do cadastro;", "Alterar o nome do cliente;", "Confirmar a operação;", "O sistema valida o campo nome (obrigatório) e atualiza o registro com a data de alteração."]),
            ("3.4 Excluir Cliente (Soft Delete):", ["Selecionar um cliente ativo da listagem;", "Solicitar exclusão do cliente;", "Confirmar a operação;", "O campo deleted_at é preenchido com a data da exclusão (soft delete);", "O cliente é removido da listagem ativa, mas permanece no banco de dados, preservando o histórico de vendas associadas."]),
            ("3.5 Buscar Cliente:", ["Acessar o módulo de clientes;", "Informar um termo de busca no campo de pesquisa;", "O sistema filtra e exibe os clientes cujo nome corresponde ao termo informado;", "Caso nenhum cliente seja encontrado, o sistema exibe a listagem vazia."]),
        ],
        "alt_paras": [
            ("3.6 Dados Inseridos Incorretamente:", "Caso o campo nome não seja informado ou esteja em branco, o sistema deverá solicitar a correção das informações antes de prosseguir com o cadastro ou a edição do cliente."),
            ("3.7 Cliente Já Excluído:", "Caso o usuário tente editar ou excluir um cliente que já possua o campo deleted_at preenchido, o sistema deverá informar que o cliente não está disponível para a operação solicitada."),
            ("3.8 Falha na Conexão com a Internet:", "Problemas relacionados à conexão podem impedir o cadastro, atualização, exclusão ou carregamento da listagem de clientes."),
        ],
        "s4": "Não existem subfluxos associados ao caso de uso suc_Gerenciar_Clientes.",
        "s5": "O cenário chave do caso de uso suc_Gerenciar_Clientes consiste no cadastro correto de clientes no sistema, garantindo a disponibilidade dessas informações para associação às vendas registradas, além de permitir a atualização e exclusão lógica dos dados com preservação do histórico.",
        "s6": "Para utilização do caso de uso suc_Gerenciar_Clientes, o usuário deve possuir acesso autorizado ao sistema e conexão adequada com a internet.",
        "s7": "Após a execução do caso de uso, os clientes cadastrados permanecem armazenados no banco de dados, permitindo sua associação às vendas, consulta no histórico do sistema e utilização nos relatórios financeiros. Clientes excluídos via soft delete mantêm seu histórico de vendas preservado.",
        "s8": ["O caso de uso suc_Gerenciar_Clientes possui relação com o caso de uso suc_Gerenciar_Vendas, sendo estendido por ele durante o processo de registro de uma venda. No momento da venda, o proprietário poderá realizar a busca de clientes já cadastrados no sistema ou realizar o cadastro de um novo cliente diretamente pela funcionalidade de vendas, associando-o imediatamente à venda registrada.", "Além disso, também será possível realizar a exclusão lógica de clientes disponíveis na listagem apresentada durante o processo de venda, conforme as permissões do sistema."],
        "s9": ["O sistema deve garantir que o campo nome do cliente seja sempre preenchido, não permitindo cadastros ou atualizações com nome vazio ou em branco.", "O sistema deve implementar exclusão lógica (soft delete), preenchendo o campo deleted_at em vez de remover o registro do banco de dados, preservando o histórico de vendas associadas ao cliente.", "O sistema deve disponibilizar funcionalidade de busca de clientes por nome para utilização tanto no módulo de clientes quanto durante o processo de registro de vendas."],
        "s10": "O caso de uso suc_Gerenciar_Clientes possui relação de extensão com o caso de uso suc_Gerenciar_Vendas, permitindo a busca e o cadastro de clientes durante o processo de venda.",
        "figure_width": 277,
    },
    {
        "name": "relatorios", "title": "suc_Gerar_Relatorios", "date": "11/08/2026",
        "source": "rup_Especificacao-suc_Gerar_Relatorios-Enzo-Dutra.pdf",
        "output": "rup_Especificacao-suc_Gerar_Relatorios-Enzo-Dutra-Padronizado.pdf",
        "toc": [
            ("1. BREVE DESCRIÇÃO", 3), ("2. FLUXO BÁSICO DE EVENTOS", 3),
            ("3. FLUXOS ALTERNATIVOS", 4), ("3.1 Visualizar Dashboard Geral", 4),
            ("3.2 Filtrar Relatório por Período", 4), ("3.3 Filtrar Relatório por Produto", 4),
            ("3.4 Visualizar Desempenho por Produto", 5),
            ("3.5 Sem Dados para o Período Informado", 5),
            ("3.6 Datas Inseridas Incorretamente", 5),
            ("3.7 Falha na Conexão com a Internet", 5),
            ("4. SUBFLUXOS", 6), ("5. CENÁRIO CHAVE", 6),
            ("6. CONDIÇÕES PRÉVIAS", 6), ("7. CONDIÇÕES POSTERIORES", 6),
            ("8. PONTOS DE EXTENSÃO", 7), ("9. REQUISITOS ESPECIAIS", 7),
            ("10. INFORMAÇÕES ADICIONAIS", 8),
        ],
        "brief": "O caso de uso suc_Gerar_Relatorios tem como objetivo permitir a visualização e análise do desempenho financeiro e de vendas do negócio por meio de um dashboard consolidado. A funcionalidade possibilita ao proprietário acompanhar indicadores como receita total, quantidade de vendas realizadas e desempenho individual de cada produto, podendo aplicar filtros por período e por produto para refinar as informações exibidas.",
        "basic": "O fluxo básico de eventos do caso de uso suc_Gerar_Relatorios tem como objetivo exibir de forma consolidada os dados financeiros e de vendas registrados no sistema. Para utilização adequada da funcionalidade, é necessário possuir conexão com a internet e acesso autorizado ao sistema.",
        "basic_bullets": ["O sistema carrega automaticamente os dados consolidados das vendas;", "Visualizar os indicadores do dashboard: receita total, total de vendas e desempenho por produto;", "Aplicar filtros de período (data inicial e data final) para refinar os resultados, se desejado;", "Aplicar filtro por produto específico para analisar seu desempenho individual, se desejado;", "O sistema recalcula e exibe os indicadores com base nos filtros aplicados;"],
        "alternatives": [
            ("3.1 Visualizar Dashboard Geral:", ["O sistema consolida todos os registros de vendas sem filtro aplicado;", "Exibir a receita total acumulada de todas as vendas;", "Exibir o número total de vendas registradas;", "Exibir a listagem de desempenho por produto, contendo nome do produto, quantidade total vendida e receita gerada."]),
            ("3.2 Filtrar Relatório por Período:", ["Informar uma data inicial e final nos campos correspondentes;", "O sistema aplica o filtro e consulta apenas as vendas realizadas dentro do intervalo de datas informado;", "Os indicadores do dashboard são recalculados com base no período selecionado."]),
            ("3.3 Filtrar Relatório por Produto:", ["Selecionar um produto específico no filtro disponível;", "O sistema consulta apenas as vendas vinculadas ao produto selecionado;", "Os indicadores do dashboard são recalculados considerando exclusivamente as vendas daquele produto."]),
            ("3.4 Visualizar Desempenho por Produto:", ["O sistema agrupa as vendas registradas por produto;", "Para cada produto, exibe o nome, a quantidade total de unidades vendidas e a receita total gerada;", "Caso um produto tenha sido removido do sistema, seu nome é exibido como 'Produto removido', preservando os dados históricos da venda."]),
        ],
        "alt_paras": [
            ("3.5 Sem Dados para o Período Informado:", "Caso não existam vendas registradas para o período ou filtro selecionado, o sistema deverá exibir os indicadores zerados (receita total: 0, total de vendas: 0) e uma listagem de desempenho vazia, informando ao proprietário a ausência de dados."),
            ("3.6 Datas Inseridas Incorretamente:", "Caso o formato das datas informadas nos filtros seja inválido, o sistema deverá desconsiderar o filtro inválido e manter a exibição dos dados sem aquele critério de filtragem aplicado."),
            ("3.7 Falha na Conexão com a Internet:", "Problemas relacionados à conexão podem impedir o carregamento dos dados do dashboard e a aplicação dos filtros de relatório."),
        ],
        "s4": "Não existem subfluxos associados ao caso de uso suc_Gerar_Relatorios.",
        "s5": "O cenário chave do caso de uso suc_Gerar_Relatorios consiste na visualização consolidada dos dados financeiros e de vendas do negócio, permitindo ao proprietário acompanhar indicadores como receita total, número de vendas e desempenho por produto, com possibilidade de filtragem por período e por produto para análise detalhada do desempenho.",
        "s6": "Para utilização do caso de uso suc_Gerar_Relatorios, o usuário deve possuir acesso autorizado ao sistema, conexão adequada com a internet e ao menos uma venda registrada no banco de dados para que os indicadores sejam exibidos com dados reais.",
        "s7": "Após a execução do caso de uso, nenhuma alteração é realizada no banco de dados. O módulo de relatórios é exclusivamente de leitura e consulta, consolidando as informações já registradas pelas operações de venda para apresentação ao proprietário.",
        "s8": ["O caso de uso suc_Gerar_Relatorios possui dependência dos dados gerados pelo caso de uso suc_Gerenciar_Vendas, uma vez que os indicadores do dashboard são calculados a partir das vendas registradas no sistema. Não há relação de extensão com outros casos de uso, pois o módulo de relatórios é somente de leitura e não permite o cadastro ou a alteração de nenhuma informação."],
        "s9": ["O sistema deve consolidar automaticamente os dados de todas as vendas registradas ao carregar o módulo de relatórios, sem necessidade de ação do usuário;", "O sistema deve suportar filtragem combinada por período (data inicial e data final) e por produto, de forma independente ou simultânea;", "Quando nenhuma venda for encontrada para os filtros aplicados, o sistema deve retornar os indicadores zerados e sinalizar a ausência de dados ao proprietário;", "O sistema deve preservar o histórico financeiro de vendas mesmo quando o produto associado for excluído, exibindo o nome 'Produto removido' nos relatórios de desempenho;", "O módulo de relatórios não deve permitir nenhuma operação de escrita no banco de dados, sendo restrito exclusivamente à leitura e consolidação de informações."],
        "s10": "O caso de uso suc_Gerar_Relatorios depende diretamente dos dados gerados pelo caso de uso suc_Gerenciar_Vendas. Os indicadores exibidos no dashboard - receita total, total de vendas e desempenho por produto - são calculados em tempo real a partir das vendas ativas (não excluídas via soft delete) armazenadas no banco de dados.",
        "figure_width": 283,
    },
]


def title_page3(body: PageBody, case: dict):
    body.heading(f"Especificação de Caso de Uso: {case['title']}", level=0)
    body.para(f"Este documento tem como objetivo apresentar todas as especificações dos requisitos funcionais do caso de uso {case['title']}.", intro=True, gap=17)
    body.heading("1. BREVE DESCRIÇÃO")
    body.para(case["brief"], gap=16)
    body.heading("2. FLUXO BÁSICO DE EVENTOS")
    body.para(case["basic"], gap=8)
    body.bullets(case["basic_bullets"], gap=4)


def alternative(body: PageBody, heading: str, bullets: list[str]):
    body.heading(heading, level=2)
    body.bullets(bullets, gap=8)
    body.gap(9)


def section(body: PageBody, heading: str, paragraphs: list[str] | str, gap=13):
    body.heading(heading, level=2)
    if isinstance(paragraphs, str):
        paragraphs = [paragraphs]
    for paragraph in paragraphs:
        body.para(paragraph, gap=gap)
    body.gap(8)


def build(case: dict):
    output = BASE / case["output"]
    c = Canvas(str(output), pagesize=letter, pageCompression=1)
    c.setTitle(f"Especificação de Caso de Uso: {case['title']}")
    c.setAuthor("Enzo Dutra")
    draw_cover(c, case["title"], case["date"])
    draw_index(c, case["title"], case["date"], case["toc"])

    body = PageBody(c, case["title"], case["date"], 3, start=144.7)
    title_page3(body, case)
    body.check()

    body = PageBody(c, case["title"], case["date"], 4, start=149.7)
    body.heading("3. FLUXOS ALTERNATIVOS", level=2)
    body.para(f"Nesta seção são apresentados os fluxos alternativos relacionados ao caso de uso {case['title']}.", gap=15)
    for heading, entries in case["alternatives"][:3]:
        alternative(body, heading, entries)
    body.check()

    body = PageBody(c, case["title"], case["date"], 5, start=149.7)
    if case["name"] == "clientes":
        for heading, entries in case["alternatives"][3:]:
            alternative(body, heading, entries)
        for heading, paragraph in case["alt_paras"][:1]:
            section(body, heading, paragraph, gap=9)
    else:
        for heading, entries in case["alternatives"][3:]:
            alternative(body, heading, entries)
        for heading, paragraph in case["alt_paras"]:
            section(body, heading, paragraph, gap=9)
    body.check()

    body = PageBody(c, case["title"], case["date"], 6, start=149.7)
    if case["name"] == "clientes":
        for heading, paragraph in case["alt_paras"][1:]:
            section(body, heading, paragraph)
    section(body, "4. SUBFLUXOS", case["s4"])
    section(body, "5. CENÁRIO CHAVE", case["s5"])
    section(body, "6. CONDIÇÕES PRÉVIAS", case["s6"])
    if case["name"] == "relatorios":
        section(body, "7. CONDIÇÕES POSTERIORES", case["s7"])
    body.check()

    body = PageBody(c, case["title"], case["date"], 7, start=149.7)
    if case["name"] == "clientes":
        section(body, "7. CONDIÇÕES POSTERIORES", case["s7"])
    section(body, "8. PONTOS DE EXTENSÃO", case["s8"])
    section(body, "9. REQUISITOS ESPECIAIS", case["s9"], gap=7)
    body.check()

    body = PageBody(c, case["title"], case["date"], 8, start=168)
    body.heading("10. INFORMAÇÕES ADICIONAIS", level=2)
    body.para(case["s10"], gap=14)
    figure = image_for_source(BASE / case["source"])
    draw_figure(c, figure, body.top + 9, case["figure_width"])
    c.showPage()
    c.save()
    print(output)


for case in CASES:
    build(case)
