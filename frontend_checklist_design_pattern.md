### **Frontend Guide: Implementing the Auto-Saving Checklist**

This document outlines the API design and frontend development pattern for the checklist feature. The goal is to create a seamless auto-saving experience for the user.

---

#### **Core Frontend Pattern: Optimistic UI with Debouncing**

To achieve a fast, auto-saving UI, you should implement the following pattern:

1.  **Optimistic UI:** When a user makes a change (e.g., checks a box, renames an item), update the UI state *immediately*. Don't wait for the API call to finish. This makes the application feel instantaneous.
2.  **Debouncing:** As the user makes changes, don't fire an API request for every single event (like each keystroke in a text field). Instead, use a **debounce** function. This will wait for a short period of inactivity (e.g., 500ms) before sending the update to the server. This prevents spamming the API and is more efficient.
3.  **Handling API Responses:**
    *   **On Success:** The API will respond with the updated data. You can use this to silently re-sync your local state, ensuring it's consistent with the database.
    *   **On Failure:** If the API returns an error, you **must** revert the optimistic UI change to its previous state and notify the user that their change could not be saved.

---

#### **API Endpoints and Usage**

All updates should be sent using the `PATCH` HTTP method, which allows for sending only the fields that have changed.

##### **1. Updating a Single Checklist Item**

This is the most common operation and will be used for checking/unchecking a box, renaming an item, or changing its date.

*   **Endpoint:** `PATCH /api/items/{item_id}`
*   **Description:** Updates a single property of a specific item.

**Example: Marking an item as complete**

*   **Request Payload:**
    ```json
    {
      "completed": true
    }
    ```

**Example: Renaming an item**

*   **Request Payload:**
    ```json
    {
      "text": "My newly renamed item title"
    }
    ```

*   **Success Response (`200 OK`):** The server will return the full, updated item object.

    ```json
    {
      "id": 123,
      "text": "My newly renamed item title",
      "completed": false,
      "category_id": 45,
      "due_date": "2025-04-20T00:00:00.000Z",
      "updated_at": "2023-10-27T10:00:01.000Z"
    }
    ```

*   **Error Response (`4xx`/`5xx`):** The server will return an error object. You must use this to revert the UI.

    ```json
    {
      "error": "Invalid data provided",
      "message": "Text field cannot be empty."
    }
    ```

##### **2. Batch Updating Multiple Items**

This endpoint is a performance optimization for actions that affect multiple items at once, like reordering a list. Sending one request is much more efficient than many.

*   **Endpoint:** `PATCH /api/items/batch`
*   **Description:** Sends an array of partial updates for multiple items in a single request.

**Example: Reordering two items**

*   **Request Payload:**
    ```json
    [
      {
        "id": 15,
        "display_order": 1
      },
      {
        "id": 23,
        "display_order": 2
      }
    ]
    ```

*   **Success Response (`200 OK`):** The server will return an array of the full, updated item objects.
    ```json
    [
      {
        "id": 15,
        "display_order": 1,
        "text": "Passport",
        "completed": true,
        "...": "..."
      },
      {
        "id": 23,
        "display_order": 2,
        "text": "Visa Photo",
        "completed": true,
        "...": "..."
      }
    ]
    ```
---

By following this guide, you can build a highly responsive and reliable user interface that feels fast and keeps data safely in sync with the backend.
