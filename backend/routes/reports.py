from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from services.report_service import ReportService
import io

router = APIRouter()
svc = ReportService()

@router.get("/summary")
def get_report_summary():
    """Dados estruturados para o módulo de relatórios."""
    return svc.get_report_data()

@router.get("/pdf")
def download_pdf():
    """Gera e descarrega relatório completo em PDF."""
    pdf_bytes = svc.generate_pdf()
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=lauOIL_relatorio.pdf"}
    )

@router.get("/excel")
def download_excel():
    """Gera e descarrega relatório completo em Excel."""
    excel_bytes = svc.generate_excel()
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=lauOIL_relatorio.xlsx"}
    )
