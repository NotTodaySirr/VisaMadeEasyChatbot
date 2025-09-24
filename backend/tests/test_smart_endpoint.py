from unittest.mock import patch


def test_smart_send_creates_conversation(client, auth_headers):
    # Mock title generation to deterministic value
    with patch('app.api.chat.routes.ai_service.generate_title_via_tool', return_value='Test Title'):
        resp = client.post('/chat/send', json={'content': 'Hello world'}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['status'] == 'processing_started'
        assert 'message_id' in data
        assert 'stream_id' in data
        assert 'conversation_id' in data
        assert data['title'] == 'Test Title'


def test_smart_send_existing_conversation(client, auth_headers):
    # First create a conversation explicitly
    resp_conv = client.post('/chat/conversations', json={'title': 'Manually Created'}, headers=auth_headers)
    assert resp_conv.status_code == 201
    conv_id = resp_conv.get_json()['id']

    # Then send a message to existing conversation
    resp = client.post('/chat/send', json={'conversation_id': conv_id, 'content': 'Follow up'}, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['status'] == 'processing_started'
    assert 'message_id' in data
    assert 'stream_id' in data
    # Should not include new conversation fields
    assert 'conversation_id' not in data or data.get('conversation_id') == conv_id
    assert 'title' not in data


def test_smart_send_sanitizes_title(client, auth_headers):
    with patch('app.api.chat.routes.ai_service.generate_title_via_tool', return_value='<b>Unsafe</b>   title\n'):
        resp = client.post('/chat/send', json={'content': 'Hello'}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['title'] == 'Unsafe title'


