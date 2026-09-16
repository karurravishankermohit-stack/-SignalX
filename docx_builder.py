"""
SignalX Document Generator
Generates a complete, beautifully structured Microsoft Word (.docx) document
using Python standard library (zipfile + xml.etree.ElementTree).
No external C-extension DLLs required.
"""

import os
import zipfile
import xml.sax.saxutils as saxutils

def escape(text):
    return saxutils.escape(str(text))

class DocxBuilder:
    def __init__(self):
        self.paragraphs = []
        self.core_properties = {
            'title': 'SignalX — Automated RF Signal Intelligence Platform Complete System Manual',
            'creator': 'National Technical Research Organisation (NTRO) / SignalX Engineering Team',
            'subject': 'SIH 2026 Problem Statement SIH26147 System Walkthrough and Operational Guide',
            'keywords': 'SignalX, RF, DSP, Signal Intelligence, NTRO, SIH2026, Demodulation, FEC, Waterfall, Constellation',
        }

    def add_p(self, xml_content):
        self.paragraphs.append(f"<w:p>{xml_content}</w:p>")

    def add_title(self, text, subtitle=None):
        p = (
            f"<w:pPr><w:jc w:val=\"center\"/><w:spacing w:before=\"360\" w:after=\"120\"/></w:pPr>"
            f"<w:r><w:rPr><w:rFonts w:ascii=\"Arial Black\" w:hAnsi=\"Arial Black\"/><w:b/><w:sz w:val=\"52\"/><w:color w:val=\"0F172A\"/></w:rPr><w:t>{escape(text)}</w:t></w:r>"
        )
        self.paragraphs.append(f"<w:p>{p}</w:p>")
        if subtitle:
            sub = (
                f"<w:pPr><w:jc w:val=\"center\"/><w:spacing w:before=\"0\" w:after=\"300\"/></w:pPr>"
                f"<w:r><w:rPr><w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\"/><w:sz w:val=\"26\"/><w:color w:val=\"0284C7\"/><w:b/></w:rPr><w:t>{escape(subtitle)}</w:t></w:r>"
            )
            self.paragraphs.append(f"<w:p>{sub}</w:p>")

    def add_h1(self, text):
        p = (
            f"<w:pPr><w:spacing w:before=\"400\" w:after=\"160\"/><w:pBdr><w:bottom w:val=\"single\" w:sz=\"12\" w:space=\"4\" w:color=\"0284C7\"/></w:pBdr></w:pPr>"
            f"<w:r><w:rPr><w:rFonts w:ascii=\"Arial\" w:hAnsi=\"Arial\"/><w:b/><w:sz w:val=\"34\"/><w:color w:val=\"0369A1\"/></w:rPr><w:t>{escape(text)}</w:t></w:r>"
        )
        self.paragraphs.append(f"<w:p>{p}</w:p>")

    def add_h2(self, text):
        p = (
            f"<w:pPr><w:spacing w:before=\"280\" w:after=\"120\"/></w:pPr>"
            f"<w:r><w:rPr><w:rFonts w:ascii=\"Arial\" w:hAnsi=\"Arial\"/><w:b/><w:sz w:val=\"26\"/><w:color w:val=\"0F172A\"/></w:rPr><w:t>{escape(text)}</w:t></w:r>"
        )
        self.paragraphs.append(f"<w:p>{p}</w:p>")

    def add_h3(self, text):
        p = (
            f"<w:pPr><w:spacing w:before=\"200\" w:after=\"80\"/></w:pPr>"
            f"<w:r><w:rPr><w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\"/><w:b/><w:sz w:val=\"22\"/><w:color w:val=\"0284C7\"/></w:rPr><w:t>{escape(text)}</w:t></w:r>"
        )
        self.paragraphs.append(f"<w:p>{p}</w:p>")

    def add_paragraph(self, text, bold=False, italic=False, color="334155", size=22):
        rPr = f"<w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\"/><w:sz w:val=\"{size}\"/><w:color w:val=\"{color}\"/>"
        if bold:
            rPr += "<w:b/>"
        if italic:
            rPr += "<w:i/>"
        p = (
            f"<w:pPr><w:spacing w:before=\"60\" w:after=\"100\"/><w:line w:line=\"276\" w:lineRule=\"auto\"/></w:pPr>"
            f"<w:r><w:rPr>{rPr}</w:rPr><w:t xml:space=\"preserve\">{escape(text)}</w:t></w:r>"
        )
        self.paragraphs.append(f"<w:p>{p}</w:p>")

    def add_bullet(self, lead_text, body_text):
        p = (
            f"<w:pPr><w:pStyle w:val=\"ListBullet\"/><w:ind w:left=\"400\" w:hanging=\"260\"/><w:spacing w:before=\"40\" w:after=\"60\"/></w:pPr>"
            f"<w:r><w:rPr><w:rFonts w:ascii=\"Arial\" w:hAnsi=\"Arial\"/><w:b/><w:sz w:val=\"20\"/><w:color w:val=\"0284C7\"/></w:rPr><w:t xml:space=\"preserve\">• {escape(lead_text)}: </w:t></w:r>"
            f"<w:r><w:rPr><w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\"/><w:sz w:val=\"22\"/><w:color w:val=\"334155\"/></w:rPr><w:t>{escape(body_text)}</w:t></w:r>"
        )
        self.paragraphs.append(f"<w:p>{p}</w:p>")

    def add_callout(self, title, text, style="note"):
        # colors: note=sky, warning=amber, success=emerald
        if style == "warning":
            bg = "FFFBEB"
            border = "D97706"
            tcol = "92400E"
        elif style == "success":
            bg = "F0FDF4"
            border = "16A34A"
            tcol = "166534"
        else: # note
            bg = "F0F9FF"
            border = "0284C7"
            tcol = "075985"

        p = (
            f"<w:pPr>"
            f"<w:pBdr><w:left w:val=\"single\" w:sz=\"24\" w:space=\"12\" w:color=\"{border}\"/></w:pBdr>"
            f"<w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"{bg}\"/>"
            f"<w:ind w:left=\"240\" w:right=\"240\"/>"
            f"<w:spacing w:before=\"140\" w:after=\"140\"/>"
            f"</w:pPr>"
            f"<w:r><w:rPr><w:rFonts w:ascii=\"Arial\" w:hAnsi=\"Arial\"/><w:b/><w:sz w:val=\"20\"/><w:color w:val=\"{tcol}\"/></w:rPr><w:t>{escape(title)}: </w:t></w:r>"
            f"<w:r><w:rPr><w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\"/><w:sz w:val=\"20\"/><w:color w:val=\"1E293B\"/></w:rPr><w:t>{escape(text)}</w:t></w:r>"
        )
        self.paragraphs.append(f"<w:p>{p}</w:p>")

    def add_table(self, headers, rows):
        tbl = ["<w:tbl>"]
        tbl.append(
            "<w:tblPr>"
            "<w:tblW w:w=\"0\" w:type=\"auto\"/>"
            "<w:jc w:val=\"center\"/>"
            "<w:tblBorders>"
            "<w:top w:val=\"single\" w:sz=\"8\" w:space=\"0\" w:color=\"CBD5E1\"/>"
            "<w:left w:val=\"none\"/>"
            "<w:bottom w:val=\"single\" w:sz=\"8\" w:space=\"0\" w:color=\"CBD5E1\"/>"
            "<w:right w:val=\"none\"/>"
            "<w:insideH w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"E2E8F0\"/>"
            "<w:insideV w:val=\"none\"/>"
            "</w:tblBorders>"
            "</w:tblPr>"
        )

        # Header Row
        tbl.append("<w:tr><w:trPr><w:tblHeader/></w:trPr>")
        for h in headers:
            tbl.append(
                f"<w:tc><w:tcPr><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"0F172A\"/>"
                f"<w:tcMar><w:top w:w=\"120\"/><w:bottom w:w=\"120\"/><w:left w:w=\"160\"/><w:right w:w=\"160\"/></w:tcMar></w:tcPr>"
                f"<w:p><w:r><w:rPr><w:rFonts w:ascii=\"Arial\" w:hAnsi=\"Arial\"/><w:b/><w:sz w:val=\"18\"/><w:color w:val=\"FFFFFF\"/></w:rPr><w:t>{escape(h)}</w:t></w:r></w:p></w:tc>"
            )
        tbl.append("</w:tr>")

        # Data Rows
        for r_idx, row in enumerate(rows):
            fill = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            tbl.append("<w:tr>")
            for cell in row:
                tbl.append(
                    f"<w:tc><w:tcPr><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"{fill}\"/>"
                    f"<w:tcMar><w:top w:w=\"100\"/><w:bottom w:w=\"100\"/><w:left w:w=\"160\"/><w:right w:w=\"160\"/></w:tcMar></w:tcPr>"
                    f"<w:p><w:r><w:rPr><w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\"/><w:sz w:val=\"20\"/><w:color w:val=\"334155\"/></w:rPr><w:t>{escape(cell)}</w:t></w:r></w:p></w:tc>"
                )
            tbl.append("</w:tr>")

        tbl.append("</w:tbl>")
        self.paragraphs.append("".join(tbl))

    def add_page_break(self):
        self.paragraphs.append("<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>")

    def build(self, output_path):
        body_content = "".join(self.paragraphs)

        content_types = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n'
            '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n'
            '  <Default Extension="xml" ContentType="application/xml"/>\n'
            '  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n'
            '  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>\n'
            '  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n'
            '  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>\n'
            '</Types>'
        )

        root_rels = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
            '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n'
            '  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>\n'
            '  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>\n'
            '</Relationships>'
        )

        word_rels = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
            '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n'
            '</Relationships>'
        )

        styles = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
            '  <w:docDefaults>\n'
            '    <w:rPrDefault>\n'
            '      <w:rPr>\n'
            '        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>\n'
            '        <w:sz w:val="22"/>\n'
            '        <w:color w:val="334155"/>\n'
            '      </w:rPr>\n'
            '    </w:rPrDefault>\n'
            '  </w:docDefaults>\n'
            '  <w:style w:type="paragraph" w:styleId="ListBullet">\n'
            '    <w:name w:val="List Bullet"/>\n'
            '    <w:qFormat/>\n'
            '  </w:style>\n'
            '</w:styles>'
        )

        core_props = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
            'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">\n'
            f'  <dc:title>{escape(self.core_properties["title"])}</dc:title>\n'
            f'  <dc:creator>{escape(self.core_properties["creator"])}</dc:creator>\n'
            f'  <dc:subject>{escape(self.core_properties["subject"])}</dc:subject>\n'
            f'  <cp:keywords>{escape(self.core_properties["keywords"])}</cp:keywords>\n'
            '</cp:coreProperties>'
        )

        app_props = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">\n'
            '  <Application>SignalX Automated Platform</Application>\n'
            '  <DocSecurity>0</DocSecurity>\n'
            '</Properties>'
        )

        doc_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
            f'  <w:body>{body_content}'
            '    <w:sectPr>\n'
            '      <w:pgSz w:w="12240" w:h="15840"/>\n'
            '      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>\n'
            '    </w:sectPr>\n'
            '  </w:body>\n'
            '</w:document>'
        )

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as docx:
            docx.writestr('[Content_Types].xml', content_types)
            docx.writestr('_rels/.rels', root_rels)
            docx.writestr('word/_rels/document.xml.rels', word_rels)
            docx.writestr('word/document.xml', doc_xml)
            docx.writestr('word/styles.xml', styles)
            docx.writestr('docProps/core.xml', core_props)
            docx.writestr('docProps/app.xml', app_props)

        print(f"Successfully generated DOCX at: {output_path}")

print("DocxBuilder class defined successfully!")
