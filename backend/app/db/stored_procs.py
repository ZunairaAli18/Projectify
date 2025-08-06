from app.db.db import get_connection
from datetime import timedelta
import os
from werkzeug.utils import secure_filename
from psycopg2.extensions import register_adapter, AsIs

# Tell psycopg2 how to convert Python lists to PostgreSQL arrays
def adapt_list(lst):
    return AsIs("ARRAY[%s]" % ','.join(str(x) for x in lst))

# Register the adapter globally (one-time setup)
register_adapter(list, adapt_list)


def create_user(name, email, password, age, gender, bloodGroup, department):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT create_user(%s, %s, %s, %s, %s, %s, %s);",
            (name, email, password, age, gender, bloodGroup, department)
        )

        message = cur.fetchone()[0] if cur.description else "User registered successfully"
        conn.commit()
        cur.close()
        conn.close()

        return {"Success": True, "message": message}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def verify_user_credentials(email, password):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM verify_user_credentials(%s, %s);", (email, password))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            user_id, name, email, role_id = user
            return {
                "Success": True,
                "user": {
                    "user_id": user_id,
                    "name": name,
                    "email": email,
                    "role_id": role_id
                }
            }
        else:
            return {"Success": False, "error": "Invalid credentials"}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def getAllUsers():
    try:
        conn=get_connection()
        cur=conn.cursor()
        cur.execute("SELECT * FROM get_all_users();")
        rows = cur.fetchall()
        conn.commit()
        cur.close()
        conn.close()

        columns = [
            "user_id", "name", "email", "role_id",
            "age", "gender", "blood_group", "joined_at", "modified_at","department_name"
        ]
        # Convert rows to list of dicts
        users = [dict(zip(columns, row)) for row in rows]

        return {
            "Success": True,
            "users": users
        }
    except Exception as e:
        return {"Success": False, "error": str(e)}

def get_all_projects_summary():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_all_project_summary();")
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        result = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()
        return {"Success": True, "data": result}
    except Exception as e:
        return {"Success": False, "error": str(e)}
 
def add_project(title, status_id, created_by, deadline):
    try:
        conn=get_connection()
        cur=conn.cursor()
        cur.execute(
            "SELECT add_project(%s, %s, %s, %s);",
            (title, status_id, created_by, deadline)
        )
        
        message = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {"success": True, "message": message}
    except Exception as e:
        return {"success": False, "error": str(e)} 

def add_user_story(project_id, title, description, status_id, created_by, estimated_time):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT add_user_story(%s, %s, %s, %s, %s, %s);",
                    (project_id, title, description, status_id, created_by, estimated_time))
        story_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {"success": True, "story_id": story_id}
    except Exception as e:
        return {"success": False, "error": str(e)} 
 
def get_project_members_from_db(project_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_project_members(%s);", (project_id,))
        rows = cur.fetchall()

        columns = [desc[0] for desc in cur.description]
        members = [dict(zip(columns, row)) for row in rows]

        cur.close()
        conn.close()

        return {"success": True, "users": members}
    except Exception as e:
        return {"success": False, "error": str(e)}
 
def assign_member_to_project_in_db(project_id, user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT assign_member_to_project(%s, %s);", (project_id, user_id))
        result_message = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

        return {"success": True, "message": result_message}
    except Exception as e:
        return {"success": False, "error": str(e)}
 
def get_assigned_members(story_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_assigned_members(%s);", (story_id,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        members = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()

        return {"Success": True, "members": members}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def assign_user_to_story(story_id, user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT assign_user_to_story(%s, %s);", (story_id, user_id))
        message = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {"Success": True, "message": message}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def get_user_story_details(story_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_user_story_details(%s);", (story_id,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        story_details = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()

        return {"Success": True, "details": story_details}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def update_user_story_with_history(story_id, title, description, status_id, estimated_time):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT update_user_story_with_history(%s, %s, %s, %s, %s);",
            (story_id, title, description, status_id, estimated_time)
        )
        message = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

        return {"success": True, "message": message}
    except Exception as e:
        return {"success": False, "error": str(e)}
 
def update_project_in_db(project_id, new_title, new_deadline):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT update_project_with_versioning(%s, %s, %s);
        """, (project_id, new_title, new_deadline))
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {"success": True, "message": result[0]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_projects_created_by_email(email):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_projects_created_by_email(%s);", (email,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()
        return {"Success": True, "data": data}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def get_my_projects_by_email(email):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_my_projects_by_email(%s);", (email,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()
        return {"Success": True, "data": data}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def get_user_profile_by_id(user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_user_profile_by_id(%s);", (user_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if row:
            columns = ["user_id", "name", "email", "age", "gender", "blood_group", "joined_at", "modified_at", "department_name"]
            profile = dict(zip(columns, row))
            return {"Success": True, "profile": profile}
        else:
            return {"Success": False, "error": "User not found"}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def get_unassigned_users_from_db(project_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_users_not_assigned_to_project(%s);",(project_id,))
        rows = cur.fetchall()
        col_names = [desc[0] for desc in cur.description]
        users = [dict(zip(col_names, row)) for row in rows]
        cur.close()
        conn.close()

        return {"success": True, "users": users}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_user_stories_by_project(project_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM sp_get_user_stories_by_project(%s);", (project_id,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()
        conn.close()
        
        stories = []
        for row in rows:
            story = dict(zip(columns, row))
            if isinstance(story.get("estimated_time"), timedelta):
                story["estimated_time"] = str(story["estimated_time"])
            stories.append(story)

        return {"Success": True, "stories": stories}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def update_story_status_in_db(story_id, new_status_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT sp_update_user_story_status(%s, %s);", (story_id, new_status_id))
        message = cur.fetchone()[0]
        print("hello",message)
        cur.close()
        conn.commit()
        conn.close()

        return {"success": True, "message": message}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_attachments_by_project(project_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_attachments_by_project(%s);", (project_id,))
        rows = cur.fetchall()
        
        attachments = []
        for row in rows:
            attachments.append({
                "project_id": row[0],
                "attachment_id": row[1],
                "file_name": row[2],
                "file_type": row[3],
                "uploaded_by": row[4],
                "created_by": row[5]
            })

        cur.close()
        conn.close()
        return {"success": True, "attachments": attachments}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_all_departments():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_all_departments();")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        departments = [
            {"department_id": row[0], "name": row[1]} for row in rows
        ]

        return {"Success": True, "departments": departments}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def get_users_not_assigned_to_story(story_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_users_not_assigned_to_story(%s);", (story_id,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        users = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()
        
        return {"Success": True, "members": users}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def update_user_profile_with_history(data):
    try:
        user_id = data.get("user_id")
        age = data.get("age")
        

        if user_id is None or age is None :
            raise ValueError("user_id, age, and department_id must not be None")

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT update_user_with_history(%s, %s, %s, %s, %s, %s, %s);
            """, (
                int(user_id),
                data["name"],
                data["email"],
                int(age),
                data["gender"],
                data["blood_group"],
                data["department_name"]
            ))
        message = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {"Success": True, "message": message}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def upload_attachment_to_db(file, project_id, story_id, uploaded_by, override, rename_to=None):
    try:
        filename = secure_filename(rename_to if rename_to else file.filename)
        base_dir = os.path.expanduser("~/attachments")
        project_dir = os.path.join(base_dir, f"proj_{project_id}")
        os.makedirs(project_dir, exist_ok=True)
        file_path = os.path.join(project_dir, filename)

        if os.path.exists(file_path) and not override:
            return {"Success": False, "exists": True, "message": "File already exists"}

        file.save(file_path)
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT insert_attachment(%s, %s, %s, %s, %s);",
                    (story_id, project_id, filename, file_path, uploaded_by))
        result = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {"Success": result['success'], "message": result['message']}
    except Exception as e:
        return {"Success": False, "message": str(e)}

def get_assigned_projects_by_user_id(user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_assigned_projects_by_user_id(%s);", (user_id,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        projects = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()

        return {"Success": True, "projects": projects}
    except Exception as e:
        return {"Success": False, "error": str(e)}
 
def update_event_deadline(event_id, new_deadline):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("CALL update_event_deadline(%s, %s);", (int(event_id), new_deadline))

        conn.commit()
        cur.close()
        conn.close()

        return {"Success": True, "message": f"Event {event_id} deadline updated to {new_deadline}"}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def delete_event_by_id(event_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("CALL delete_event_by_id(%s);", (event_id,))
        conn.commit()
        cur.close()
        conn.close()

        return {
            "Success": True,
            "message": f"Event {event_id} deleted successfully"
        }
    except Exception as e:
        if conn:
            conn.rollback()
        return {
            "Success": False,
            "error": str(e)
        }

def add_event(user_id, title, deadline):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT add_event(%s, %s, %s);", (user_id, title, deadline))
        conn.commit()
        cur.close()
        conn.close()
        return {"Success": True}
    except Exception as e:
        return {"Success": False, "error": str(e)}

def get_events_by_user(user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM get_events_by_user(%s);", (user_id,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        result = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()
        return {"Success": True, "data": result}
    except Exception as e:
        return {"Success": False, "error": str(e)}
 
def insert_attachment_to_db(filename, file_type, user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.callproc('upload_attachment_record', [filename, file_type, int(user_id)])
        attachment_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return attachment_id
    except Exception as e:
        raise Exception(f"Failed to insert attachment: {str(e)}")
 
def call_assign_attachment_procedure(project_id, attachment_ids):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if not isinstance(attachment_ids, list):
            raise ValueError("attachment_ids must be a list")
        
        cursor.execute("CALL assign_attachments_to_project(%s, %s::INT[]);", (project_id, attachment_ids))
        conn.commit()
        
        return {"status": "success", "message": "Attachments assigned successfully"}
    except Exception as e:
        raise e
    finally:
        cursor.close()
        conn.close()

def assign_attachment_to_story(p_attachment_id, p_project_id, p_user_story_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Call the stored procedure
        cursor.callproc('assign_attachment_to_story', [
            int(p_attachment_id),
            int(p_project_id),
            int(p_user_story_id)
        ])

        # Fetch the return message from the procedure
        result_message = cursor.fetchone()[0]

        conn.commit()
        cursor.close()
        conn.close()

        return result_message

    except Exception as e:
        raise Exception(f"Failed to assign attachment to user story: {e}")

def change_user_password(email, current_password, new_password):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("CALL change_user_password(%s, %s, %s)", (email, current_password, new_password))
        conn.commit()
        return {'success': True, 'message': 'Password updated successfully'}
    except Exception as e:
        conn.rollback()
        return {'success': False, 'message': str(e)}
    finally:
        cur.close()
        conn.close()

def insert_comment(story_id, user_id, comment_text):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("CALL insert_comment(%s, %s, %s)", (story_id, user_id, comment_text))
        conn.commit()
        cur.close()
        conn.close()
        return {"success": True, "message": "Comment inserted successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_all_project_summary_alphabetical():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM get_all_project_summary_alphabetical()")                         
            results = cur.fetchall()
            columns = [desc[0] for desc in cur.description]
            return [dict(zip(columns, row)) for row in results]
    finally:
        conn.close()

def search_projects_by_title(query):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT * FROM search_projects_by_title(%s)", (query,))
        rows = cur.fetchall()

        projects = []
        for row in rows:
            projects.append({
                "project_id": row[0],
                "title": row[1],
                "created_by": row[2],
                "created_at": row[3],
                "status": row[4],
                "deadline": row[5],
            })

        return {"success": True, "projects": projects}

    except Exception as e:
        print("Error:", e)
        return {"success": False, "message": str(e)}

    finally:
        cur.close()
        conn.close()

def search_members(query):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT search_members(%s)", (query,))
        result = cur.fetchone()[0]  # This will return the JSON result
        return {'success': True, 'members': result or []}

    except Exception as e:
        print("DB Error:", e)
        return {'success': False, 'message': str(e)}

    finally:
        cur.close()
        conn.close()

def update_project_status_based_on_stories(project_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Fetch status of all stories for the project
        cur.execute("""
            SELECT status_id FROM user_story
            WHERE project_id = %s;
        """, (project_id,))
        statuses = [row[0] for row in cur.fetchall()]
        print("Statuses:", statuses)
        if not statuses:
            return {"success": False, "error": "No user stories found for project"}

        if all(status == 4 for status in statuses):  # Assuming 3 = Confirmed
            new_status = 4  # Completed
        elif all(status == 2 for status in statuses):  # 2 = In Progress
            new_status = 2  # In Progress
        else:
            new_status = 3  # Not Started (or custom fallback)

        # Update the project status
        cur.execute("""
            UPDATE projects
            SET status_id = %s
            WHERE project_id = %s;
        """, (new_status, project_id))

        conn.commit()
        cur.close()
        conn.close()
        return {"success": True, "new_status": new_status}

    except Exception as e:
        return {"success": False, "error": str(e)}

def resume_project_based_on_stories(project_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Fetch status of all stories for the project
        cur.execute("""
            SELECT status_id FROM user_story
            WHERE project_id = %s;
        """, (project_id,))
        statuses = [row[0] for row in cur.fetchall()]
        if not statuses:
            return {"success": False, "error": "No user stories found for project"}

        if all(status == 4 for status in statuses):
            new_status = 4  # Completed
        elif all(status == 2 for status in statuses):
            new_status = 2  # In Progress
        else:
            new_status = 3  # Not Started

        # Update the project status
        cur.execute("""
            UPDATE projects
            SET status_id = %s
            WHERE project_id = %s;
        """, (new_status, project_id))

        conn.commit()
        cur.close()
        conn.close()
        return {"success": True, "new_status": new_status}

    except Exception as e:
        return {"success": False, "error": str(e)}

def pause_project(project_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Get status_id of 'Paused'
        cur.execute("""
            SELECT status_id FROM status
            WHERE LOWER(type) = 'paused';
        """)
        row = cur.fetchone()
        if not row:
            return {"success": False, "error": "'Paused' status not found"}
        
        paused_status_id = row[0]

        # Update project status to Paused
        cur.execute("""
            UPDATE projects
            SET status_id = %s
            WHERE project_id = %s;
        """, (paused_status_id, project_id))

        conn.commit()
        cur.close()
        conn.close()
        return {"success": True, "new_status": "Paused"}

    except Exception as e:
        return {"success": False, "error": str(e)}
