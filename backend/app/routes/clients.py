from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Client, Case, Document
from app.schemas import ClientCreate, ClientUpdate, ClientResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("", response_model=List[ClientResponse])
def get_clients(
    q: Optional[str] = Query(None, description="Search term"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Client).filter(Client.user_id == current_user.id)
    if q:
        search_filter = f"%{q}%"
        query = query.filter(
            (Client.full_name.ilike(search_filter)) |
            (Client.email.ilike(search_filter)) |
            (Client.phone.ilike(search_filter))
        )
    return query.order_by(Client.created_at.desc()).all()

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = Client(
        user_id=current_user.id,
        full_name=client_in.full_name,
        email=client_in.email,
        phone=client_in.phone,
        address=client_in.address,
        notes=client_in.notes
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: str,
    client_in: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    if client_in.full_name is not None:
        client.full_name = client_in.full_name
    if client_in.email is not None:
        client.email = client_in.email
    if client_in.phone is not None:
        client.phone = client_in.phone
    if client_in.address is not None:
        client.address = client_in.address
    if client_in.notes is not None:
        client.notes = client_in.notes

    db.commit()
    db.refresh(client)
    return client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return None
