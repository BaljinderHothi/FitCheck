import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
@patch("fitcheck.pages.api.user_rec.getRec.recommendationService.generateRecommendations")
@patch("fitcheck.pages.api.user_rec.getRec.supabase")
async def test_handler_success(mock_supabase, mock_recommend):
    mock_supabase.auth.getUser.return_value = {
        "data": {"user": {"email": "test@example.com"}}, "error": None
    }

    mock_supabase.from_.return_value.select.return_value.eq.return_value.single.return_value = {
        "data": {"userid": "user123"}, "error": None
    }

    mock_supabase.from_.return_value.select.return_value.eq.return_value.order.return_value = {
        "data": [
            {
                "product_name": "Hat",
                "star_rating": 4,
                "sentiment_label": "positive",
                "review_text": "Nice and stylish"
            }
        ],
        "error": None
    }

    mock_recommend.return_value = ["hat1", "hat2"]

    req = type("Req", (), {
        "method": "GET",
        "headers": {"authorization": "Bearer dummy_token"}
    })

    captured = {}
    res = type("Res", (), {
        "status": lambda self, code: setattr(self, "code", code) or self,
        "json": lambda self, data: captured.update({"json": data})
    })()

    from fitcheck.pages.api.user_rec import getRec
    await getRec.handler(req, res)

    assert res.code == 200
    assert "recommendations" in captured["json"]