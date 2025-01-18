from . import db
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import Mapped, mapped_column, validates, relationship
from sqlalchemy import String, Integer, Boolean, Date, ForeignKey, Index
from datetime import date, datetime
from flask import make_response, jsonify
class Task(db.Model, SerializerMixin):
    __tablename__='tasks'

    serialize_rules=('-user.tasks', '-user.categories', '-category.tasks', '-category.user',)

    id: Mapped[int]=mapped_column(Integer, primary_key=True)
    task: Mapped[str]=mapped_column(String(1000), nullable=False)
    date: Mapped[date]=mapped_column(Date, nullable=False, default=datetime.utcnow)
    time: Mapped[str]=mapped_column(String(100), nullable=False)
    category_id: Mapped[int]=mapped_column(Integer, ForeignKey('categories.id'), nullable=False)
    is_complete: Mapped[bool]=mapped_column(Boolean, default=False)
    user_id: Mapped[int]=mapped_column(Integer, ForeignKey('users.id'), nullable=False)

    user: Mapped['User']=relationship('User', back_populates='tasks')
    category: Mapped['Category']=relationship('Category', back_populates='tasks')

    __table_args__=(
        Index('idx_task_user_id', 'user_id'), #for filtering tasks by user
        Index('idx_task_category_id', 'category_id'), #for filtering tasks by category
        Index('idx_task_date_user', 'date', 'user_id'), #for filtering tasks by date for a specific user
        Index('idx_task_complete_user', 'is_complete', 'user_id'), #for filtering complete/ incomplete tasks
    )

    def __repr__(self):
        return f"<Task {self.id}: {self.task}>"

    @validates('task')
    def validate_task(self, key, task):
        if task is None:
            raise ValueError('Task description cannot be empty. Please provide a task description')
        return task
        
    @classmethod
    def add_task(cls, task, date, time, category_id, user_id):
        date_obj=datetime.strptime(date, '%Y-%m-%d').date()
        new_task=cls(
            task=task,
            date=date_obj,
            time=time,
            category_id=category_id,
            user_id=user_id
        )
        db.session.add(new_task)
        db.session.commit()
        return make_response(jsonify(new_task.to_dict()), 201)

    @classmethod
    def delete_task(cls, id, user_id):
        task=cls.query.filter(cls.id==id, cls.user_id==user_id).first()

        if task is None:
            response_body={
                'error':f'Task {id} not found or does not belong to the current user'
            }
            status_code=404
        else:
            db.session.delete(task)
            db.session.commit()

            response_body={
                'msg':f'Successfully deleted task {id}'
            }
            status_code=200
        return make_response(jsonify(response_body), status_code)
    
    @classmethod
    def update_task(cls, id, user_id, updated_task=None, updated_date=None, updated_time=None, updated_category=None, updated_is_complete=None):
        task_item=cls.query.filter(cls.id==id, cls.user_id==user_id).first()
        if task_item is None:
            response_body={
                'error':f'Task {id} not found or does not belong to the current user'
            }
            status_code=404
        else:
            if updated_task:
                task_item.task=updated_task
            if updated_date:
                date_obj=datetime.strptime(updated_date, '%Y-%m-%d').date()
                task_item.date=date_obj
            if updated_time:
                task_item.time=updated_time
            if updated_category:
                task_item.category_id=updated_category
            if updated_is_complete is not None:
                task_item.is_complete=updated_is_complete
            db.session.commit()

            response_body={
                'task':task_item.task,
                'date':task_item.date,
                'time':task_item.time,
                'category_id':task_item.category_id,
                'category_name':task_item.category.name if task_item.category else None,
                'is_complete':task_item.is_complete
            }
            status_code=200

        return make_response(jsonify(response_body), status_code)

    @classmethod
    def get_task(cls, id, user_id):
        task_item=cls.query.filter_by(id=id, user_id=user_id).first()
        if task_item is None:
            response_body={
                'error':f'Task {id} does not exist or does not belong to the current user'
            }
            status_code=404
        else:
            response_body={
                'task':task_item.task,
                'date':task_item.date,
                'time':task_item.time,
                'category':task_item.category_id,
                'is_complete':task_item.is_complete
            }
            status_code=200
        return make_response(jsonify(response_body), status_code)

    @classmethod
    def get_tasks(cls, user_id):
        tasks=[]
        for task in cls.query.filter_by(user_id=user_id).all():
            task_dict=task.to_dict()
            tasks.append(task_dict)

        return make_response(jsonify(tasks), 200)



