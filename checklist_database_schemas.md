### `Checklists` Table
Stores the main checklist containers. Each checklist belongs to a single user.

| Column Name      | Data Type     | Constraints / Key                  | Description                                                        |
| :--------------- | :------------ | :--------------------------------- | :----------------------------------------------------------------- |
| `checklist_id`   | `INT`         | `PK, AUTO_INCREMENT`               | Unique identifier for the checklist.                               |
| `user_id`        | `INT`         | `FK to Users.user_id, NOT NULL`    | Links to the user who owns the checklist.                          |
| `title`          | `VARCHAR(255)`| `NOT NULL`                         | The main title of the checklist (e.g., "Du học bằng thạc sĩ Mỹ").   |
| `overall_deadline`| `DATE`        | `NULL`                             | The final deadline for the entire checklist.                       |
| `created_at`     | `TIMESTAMP`   | `DEFAULT CURRENT_TIMESTAMP`        | Timestamp for when the record was created.                         |

---

### `Categories` Table
Groups related items together within a single checklist.

| Column Name    | Data Type     | Constraints / Key                        | Description                                                 |
| :------------- | :------------ | :--------------------------------------- | :---------------------------------------------------------- |
| `category_id`  | `INT`         | `PK, AUTO_INCREMENT`                     | Unique identifier for the category.                         |
| `checklist_id` | `INT`         | `FK to Checklists.checklist_id, NOT NULL`| Links the category to its parent checklist.                 |
| `title`        | `VARCHAR(255)`| `NOT NULL`                               | The name of the category (e.g., "Giấy tờ tùy thân").        |

---

### `Items` Table
Represents the individual to-do items that need to be completed.

| Column Name     | Data Type     | Constraints / Key                       | Description                                                     |
| :-------------- | :------------ | :-------------------------------------- | :-------------------------------------------------------------- |
| `item_id`       | `INT`         | `PK, AUTO_INCREMENT`                    | Unique identifier for the checklist item.                       |
| `category_id`   | `INT`         | `FK to Categories.category_id, NOT NULL`| Links the item to its parent category.                          |
| `title`         | `VARCHAR(255)`| `NOT NULL`                              | The name of the item (e.g., "Hộ chiếu").                        |
| `description`   | `TEXT`        | `NULL`                                  | A more detailed description for the item.                       |
| `deadline`      | `DATE`        | `NULL`                                  | The specific deadline for this individual item.                 |
| `is_completed`  | `BOOLEAN`     | `NOT NULL, DEFAULT false`               | Tracks the completion status (`true` or `false`).               |

---

### `UploadedFiles` Table
Stores information about files associated with a specific checklist item.

| Column Name         | Data Type      | Constraints / Key                 | Description                                                        |
| :------------------ | :------------- | :-------------------------------- | :----------------------------------------------------------------- |
| `file_id`           | `INT`          | `PK, AUTO_INCREMENT`              | Unique identifier for the uploaded file.                           |
| `item_id`           | `INT`          | `FK to Items.item_id, NOT NULL`   | Links the file to a specific checklist item.                       |
| `file_path`         | `VARCHAR(1024)`| `NOT NULL`                        | The storage path of the file (e.g., S3 URL or local path).         |
| `original_filename` | `VARCHAR(255)` | `NOT NULL`                        | The original name of the file as uploaded by the user.             |
| `uploaded_at`       | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`       | Timestamp for when the file was uploaded.                          |

---

### Relationships Summary
* A `Checklist` has many `Categories`.
* A `Category` has many `Items`.
* An `Item` can have many `UploadedFiles`.