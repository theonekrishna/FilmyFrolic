# Feedback API — User Site

> Base URL: `/api/feedback`
> Auth: ✅ User Token required
> ⚠️ These endpoints are for the **user-facing website**, NOT this admin dashboard.

---

# 1. Submit Feedback

### Endpoint

```http
POST /api/feedback
```

### Description

Allows a user to submit feedback for a Movie, Article, or Cast & Crew item.

A user can submit feedback only once for the same content.

### Request Body

```json
{
  "contentType": "movie",
  "contentId": "6fd6e41e-c75e-4a6c-8f6e-2f786b6631f8",
  "feedbackType": "incorrect_info",
  "priority": "high",
  "message": "Release year is incorrect",
  "suggestedCorrection": "Change release year from 2025 to 2024"
}
```

### Fields

| Field               | Type   | Required | Description               |
| ------------------- | ------ | -------- | ------------------------- |
| contentType         | string | Yes      | movie, article, cast_crew |
| contentId           | uuid   | Yes      | Content ID                |
| feedbackType        | string | Yes      | Type of issue             |
| priority            | string | No       | low, normal, high         |
| message             | string | Yes      | Feedback details          |
| suggestedCorrection | string | No       | Suggested correction      |

### Success Response

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "feedback_id",
    "status": "pending"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "You have already submitted feedback for this content"
}
```

---

# 2. Check Feedback Submission

### Endpoint

```http
GET /api/feedback/check
```

### Query Parameters

```http
?contentType=movie&contentId=6fd6e41e-c75e-4a6c-8f6e-2f786b6631f8
```

### Success Response (Already Submitted)

```json
{
  "success": true,
  "alreadySubmitted": true,
  "data": {
    "id": "feedback_id",
    "feedback_type": "incorrect_info",
    "priority": "high",
    "message": "Release year is incorrect",
    "suggested_correction": "Change release year from 2025 to 2024",
    "status": "pending",
    "created_at": "2026-06-05T10:30:00Z"
  }
}
```

### Success Response (Not Submitted)

```json
{
  "success": true,
  "alreadySubmitted": false,
  "data": null
}
```

---

# 3. My Feedback

### Endpoint

```http
GET /api/feedback/my-feedback
```

### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "feedback_id",
      "content_type": "movie",
      "content_id": "movie_uuid",
      "feedback_type": "incorrect_info",
      "priority": "high",
      "message": "Release year is incorrect",
      "status": "pending",
      "created_at": "2026-06-05T10:30:00Z"
    }
  ]
}
```
