"""
v1 anonymization endpoint.
"""

import logging

from fastapi import APIRouter, HTTPException

from schemas.anonymization import AnonymizeRequest, AnonymizeResponse
from services.pii_scrubber import PIIScrubberService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["anonymization"])

_pii_scrubber_service = PIIScrubberService()


@router.post("/ai/anonymize", response_model=AnonymizeResponse)
async def anonymize_text(request: AnonymizeRequest):
    """Anonymize names, locations, and dates before text is sent to external LLMs."""
    logger.info("Processing privacy-preserving anonymization request")

    try:
        result = _pii_scrubber_service.anonymize(request.text)
        return AnonymizeResponse(success=True, **result)
    except Exception as e:
        logger.error(f"Anonymization failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to anonymize text")
