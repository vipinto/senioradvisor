# Sistema de Reseñas Bidireccional "Ciego"
## U-CAN - Documentación Técnica

---

## Resumen

El sistema de reseñas de U-CAN implementa un mecanismo "ciego" bidireccional que permite tanto a **Clientes** como a **Cuidadores** calificarse mutuamente de forma justa y sin posibilidad de represalias.

---

## ¿Cómo Funciona?

### Flujo de Calificación

1. **Cliente califica al Cuidador**
   - La reseña se guarda con estado `published: false`
   - Se programa publicación automática en **7 días**
   - El sistema verifica si el Cuidador ya calificó a este Cliente

2. **Cuidador califica al Cliente**
   - La reseña se guarda con estado `published: false`
   - Se programa publicación automática en **7 días**
   - El sistema verifica si el Cliente ya calificó a este Cuidador

---

## Reglas de Publicación

| Escenario | Resultado | Tiempo |
|-----------|-----------|--------|
| **Ambos califican** | Las DOS reseñas se publican | **Inmediatamente** |
| **Solo uno califica** | La reseña se publica sola | **Después de 7 días** |
| **Ninguno califica** | No hay reseñas | N/A |

---

## ¿Por qué es "Ciego"?

### Beneficios del Sistema

| Beneficio | Descripción |
|-----------|-------------|
| **Evita represalias** | Si el cliente ve una mala reseña del cuidador, podría vengarse con otra mala reseña. El sistema ciego previene esto. |
| **Promueve honestidad** | Ambas partes califican sin saber qué puso la otra, lo que incentiva opiniones genuinas. |
| **Es justo** | Si una parte no califica, la reseña de la otra igual se publica después del período de espera de 7 días. |
| **Protege a ambas partes** | Tanto clientes como cuidadores están protegidos de calificaciones reactivas o vengativas. |

---

## Campos de Calificación

### Cliente → Cuidador

| Campo | Descripción |
|-------|-------------|
| Rating (1-5) | Calificación general |
| Comentario | Texto descriptivo de la experiencia |
| Fotos | Hasta 4 fotos opcionales |

### Cuidador → Cliente

| Campo | Descripción |
|-------|-------------|
| Rating (1-5) | Calificación general |
| Puntualidad (1-5) | Si el cliente llegó/recogió a tiempo |
| Comportamiento mascota (1-5) | Comportamiento del animal |
| Comunicación (1-5) | Calidad de la comunicación |
| Comentario | Texto descriptivo opcional |

---

## Diagrama del Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICIO COMPLETADO                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────┐                         ┌───────────────┐
│    CLIENTE    │                         │   CUIDADOR    │
│   califica    │                         │   califica    │
│   cuidador    │                         │    cliente    │
└───────┬───────┘                         └───────┬───────┘
        │                                         │
        ▼                                         ▼
┌───────────────┐                         ┌───────────────┐
│    Reseña     │                         │    Reseña     │
│  published:   │                         │  published:   │
│    false      │                         │    false      │
└───────┬───────┘                         └───────┬───────┘
        │                                         │
        └────────────────┬────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  ¿Ambos calificaron │
              │     mutuamente?     │
              └──────────┬──────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
    ┌─────────────┐             ┌─────────────┐
    │     SÍ      │             │     NO      │
    └──────┬──────┘             └──────┬──────┘
           │                           │
           ▼                           ▼
    ┌─────────────┐             ┌─────────────┐
    │  PUBLICAR   │             │   ESPERAR   │
    │   AMBAS     │             │   7 DÍAS    │
    │ INMEDIATO   │             │             │
    └─────────────┘             └──────┬──────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │  PUBLICAR   │
                                │ AUTOMÁTICO  │
                                └─────────────┘
```

---

## Implementación Técnica

### Base de Datos

**Colección `reviews`** (Cliente → Cuidador)
- review_id
- user_id (cliente)
- provider_id
- rating
- comment
- photos
- published (boolean)
- publish_after (fecha)
- created_at

**Colección `client_reviews`** (Cuidador → Cliente)
- review_id
- provider_user_id
- client_user_id
- rating
- punctuality
- pet_behavior
- communication
- comment
- published (boolean)
- publish_after (fecha)
- created_at

### Lógica de Publicación

```python
# Al crear una reseña, verificar si existe la contra-reseña
counter_review = await db.client_reviews.find_one({
    "provider_user_id": provider_user_id,
    "client_user_id": user["user_id"],
    "published": False
})

# Si existe, publicar AMBAS inmediatamente
if counter_review:
    await db.reviews.update_one(
        {"review_id": review_id}, 
        {"$set": {"published": True}}
    )
    await db.client_reviews.update_one(
        {"review_id": counter_review["review_id"]}, 
        {"$set": {"published": True}}
    )
```

---

## Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/reviews` | Cliente califica cuidador |
| POST | `/api/reviews/client` | Cuidador califica cliente |
| GET | `/api/reviews/client/me` | Ver mis calificaciones como cliente |
| GET | `/api/reviews/provider/given` | Ver calificaciones que he dado como cuidador |
| GET | `/api/providers/{id}/reviews` | Ver reseñas de un cuidador |

---

*Documento generado: Febrero 2025*
*U-CAN - Plataforma de Cuidadores de Mascotas*
