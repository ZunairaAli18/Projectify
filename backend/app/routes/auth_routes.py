from flask import Blueprint, request, jsonify, send_file
from flask_restx import Resource
from app.db.stored_procs import (
    create_user, verify_user_credentials, get_all_projects_summary, getAllUsers,
    add_project, get_project_members_from_db, update_project_in_db,
    get_my_projects_by_email, get_user_profile_by_id, get_unassigned_users_from_db,
    get_attachments_by_project, get_users_not_assigned_to_story, add_event,
    get_events_by_user, insert_attachment_to_db, add_user_story,
    get_assigned_members, assign_user_to_story, get_user_story_details,
    update_user_story_with_history, assign_member_to_project_in_db,
    get_projects_created_by_email, get_user_stories_by_project,
    update_story_status_in_db, get_all_departments, update_user_profile_with_history,
    get_assigned_projects_by_user_id, update_event_deadline, delete_event_by_id,
    call_assign_attachment_procedure,assign_attachment_to_story,change_user_password,insert_comment,get_all_project_summary_alphabetical,search_projects_by_title,
    search_members, update_project_status_based_on_stories,pause_project, resume_project_based_on_stories
)
import re
import resource
import os
from werkzeug.utils import secure_filename
import shutil
from datetime import datetime

auth_bp = Blueprint('auth', __name__)
UPLOAD_FOLDER = 'uploads'

# Email address format validation
def is_valid_email(email):
    return re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email)

@auth_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    age = data.get('age')
    gender = data.get('gender')
    bloodGroup = data.get('bloodGroup')
    department = data.get('department')

    if not all([name, email, password, age, gender, bloodGroup, department]):
        return jsonify({'error': 'All fields are required'}), 400

    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    result = create_user(name, email, password, age, gender, bloodGroup, department)
    
    if result['Success']:
        return jsonify({'message': result['message']}), 201
    else:
        return jsonify({'error': result['error']}), 500

@auth_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    result = verify_user_credentials(email, password)

    if result["Success"]:
        return jsonify({
            "message": "Login successful",
            "user": result["user"]
        }), 200
    elif result.get("error") == "Invalid credentials":
        return jsonify({"error": "Invalid credentials"}), 401
    else:
        return jsonify({"error": result.get("error", "An unknown error occurred")}), 500

@auth_bp.route('/usersList', methods=['GET'])
def get_users():
    result = getAllUsers()
    if result["Success"]:
        return jsonify({"users": result["users"]}), 200
    else:
        return jsonify({"error": result.get("error", "An unknown error occurred")}), 500

@auth_bp.route('/projects', methods=['GET'])
def fetch_all_projects():
    result = get_all_projects_summary()
    if result['Success']:
        return jsonify(result['data']), 200
    else:
        return jsonify({"error": result['error']}), 500

@auth_bp.route('/addProject', methods=['POST'])
def add_proj():
    try:
        data = request.get_json()
        title = data.get('title')
        status_id = data.get('status_id')
        created_by = data.get('created_by')
        deadline = data.get('deadline')

        if not all([title, status_id, created_by, deadline]):
            return jsonify({"error": "Missing required project fields"}), 400
        
        result = add_project(title, status_id, created_by, deadline)
        return jsonify(result), 201 if result.get("success") else 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/<int:project_id>/getProjectMembers', methods=['GET'])
def get_project_members(project_id):
    try:
        if not project_id:
            return jsonify({"error": "Missing project ID"}), 400

        result = get_project_members_from_db(project_id)

        if result["success"]:
            return jsonify({"users": result["users"]}), 200
        else:
            return jsonify({"error": result["error"]}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/<int:project_id>/assignMember', methods=['POST'])
def assign_member(project_id):
    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not project_id or not user_id:
            return jsonify({"error": "Missing project_id or user_id"}), 400

        result = assign_member_to_project_in_db(project_id, user_id)

        if result["success"]:
            return jsonify({"message": result["message"]}), 200
        else:
            return jsonify({"error": result["error"]}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/<int:project_id>/updateProject', methods=['POST'])
def update_project(project_id):
    try:
        data = request.get_json()
        new_title = data.get('title')
        new_deadline = data.get('deadline')

        if not all([new_title, new_deadline]):
            return jsonify({"error": "Missing required fields"}), 400

        result = update_project_in_db(project_id, new_title, new_deadline)

        if result["success"]:
            return jsonify({"message": result["message"]}), 200
        else:
            return jsonify({"error": result["error"]}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/user-stories', methods=['POST'])
def create_user_story():
    data = request.get_json()
    try:
        project_id = data["project_id"]
        title = data["title"]
        description = data.get("description", "")
        status_id = data["status_id"]
        created_by = data["created_by"]
        estimated_time = data["estimated_time"]

        result = add_user_story(project_id, title, description, status_id, created_by, estimated_time)

        if result["success"]:
            return jsonify({"Success": True, "message": "User story created successfully", "story_id": result["story_id"]}), 201
        else:
            return jsonify({"Success": False, "error": result["error"]}), 500
    except KeyError as e:
        return jsonify({"Success": False, "error": f"Missing field: {e}"}), 400
    except Exception as e:
        return jsonify({"Success": False, "error": str(e)}), 500

@auth_bp.route('/user-stories/<int:story_id>/members', methods=['GET'])
def fetch_story_members(story_id):
    result = get_assigned_members(story_id)
    if result["Success"]:
        return jsonify({"Success": True, "members": result["members"]}), 200
    else:
        return jsonify({"Success": False, "error": result["error"]}), 500

@auth_bp.route('/user-stories/<int:story_id>/assign', methods=['POST'])
def assign_member_to_story(story_id):
    data = request.get_json()
    user_id = data.get("user_id")
    result = assign_user_to_story(story_id, user_id)
    if result["Success"]:
        return jsonify({"Success": True, "message": result["message"]}), 200
    else:
        return jsonify({"Success": False, "error": result["error"]}), 500

@auth_bp.route('/user-stories/<int:story_id>', methods=['GET'])
def fetch_user_story_details(story_id):
    result = get_user_story_details(story_id)
    if result["Success"]:
        return jsonify({"Success": True, "details": result["details"]}), 200
    else:
        return jsonify({"Success": False, "error": result["error"]}), 500

@auth_bp.route('/user-stories/<int:story_id>/edit', methods=['PUT'])
def edit_user_story(story_id):
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        status_id = data.get('status_id')
        estimated_time = data.get('estimated_time')

        if not all([title, description, status_id, estimated_time]):
            return jsonify({"Success": False, "error": "Missing required fields"}), 400

        result = update_user_story_with_history(story_id, title, description, status_id, estimated_time)

        if result["success"]:
            return jsonify({"Success": True, "message": result["message"]}), 200
        else:
            return jsonify(result), 500
    except Exception as e:
        return jsonify({"Success": False, "error": str(e)}), 500

@auth_bp.route('/my-projects/created', methods=['POST'])
def fetch_created_projects_by_email():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"Success": False, "error": "Email is required"}), 400

    result = get_projects_created_by_email(email)
    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@auth_bp.route('/my-projects/all', methods=['POST'])
def fetch_all_projects_by_email():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"Success": False, "error": "Email is required"}), 400

    result = get_my_projects_by_email(email)
    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@auth_bp.route('/my-profile', methods=['POST'])
def get_profile():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"Success": False, "error": "user_id is required"}), 400

    result = get_user_profile_by_id(user_id)
    
    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@auth_bp.route('/<int:project_id>/unassigned-users', methods=['GET'])
def get_unassigned_users(project_id):
    result = get_unassigned_users_from_db(project_id)
    if result["success"]:
        return jsonify({"users": result["users"]}), 200
    else:
        return jsonify({"error": result.get("error", "Failed to fetch users")}), 500

@auth_bp.route('/user-stories/all', methods=['POST'])
def fetch_user_stories_by_project():
    data = request.get_json()
    project_id = data.get("project_id")

    if not project_id:
        return jsonify({"Success": False, "error": "project_id is required"}), 400

    result = get_user_stories_by_project(project_id)

    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

# @auth_bp.route('/user-story/<int:story_id>/update-status', methods=['POST'])
# def update_user_story_status(story_id):
#     try:
#         data = request.get_json()
#         new_status_id = data.get('status_id')

#         if not new_status_id:
#             return jsonify({"error": "Missing status_id"}), 400

#         result = update_story_status_in_db(story_id, new_status_id)

#         if result["success"]:
#             return jsonify({"message": result["message"]}), 200
#         else:
#             return jsonify({"error": result["error"]}), 500
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@auth_bp.route('/project/<int:project_id>/attachments', methods=['GET'])
def fetch_project_attachments(project_id):
    result = get_attachments_by_project(project_id)
    if result.get("success"):
        return jsonify({"attachments": result["attachments"]}), 200
    else:
        return jsonify({"error": result.get("error", "Unknown error occurred")}), 500
    
@auth_bp.route('/project/<int:project_id>/userstory/attachments', methods=['GET'])
def fetch_project_attachments_userstory(project_id):
    result = get_attachments_by_project(project_id)
    if result.get("success"):
        return jsonify({"attachments": result["attachments"]}), 200
    else:
        return jsonify({"error": result.get("error", "Unknown error occurred")}), 500    

@auth_bp.route('/departments', methods=['GET'])
def fetch_all_departments():
    try:
        result = get_all_departments()
        if result["Success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
    except Exception as e:
        return jsonify({"Success": False, "error": str(e)}), 500

@auth_bp.route('/story/<int:story_id>/unassigned-users', methods=['GET'])
def fetch_unassigned_users_for_story(story_id):
    result = get_users_not_assigned_to_story(story_id)
    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@auth_bp.route('/update-profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    required_fields = [ "name", "email", "age", "gender", "blood_group", "department_name", "user_id"]
    print(data)
    if not all(field in data for field in required_fields):
        return jsonify({"Success": False, "error": "Missing required fields"}), 400

    result = update_user_profile_with_history(data)

    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@auth_bp.route('/assigned-projects/<int:user_id>', methods=['GET'])
def fetch_assigned_projects_by_user_id(user_id):
    if not user_id:
        return jsonify({"Success": False, "error": "user_id is required"}), 400

    result = get_assigned_projects_by_user_id(user_id)
    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@auth_bp.route('/update-event-deadline', methods=['POST'])
def update_event_deadline_route():
    data = request.get_json()
    event_id = data.get('event_id')
    new_deadline = data.get('new_deadline')

    if not event_id or not new_deadline:
        return jsonify({"Success": False, "error": "event_id and new_deadline are required"}), 400

    result = update_event_deadline(event_id, new_deadline)
    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@auth_bp.route('/delete-event/<int:event_id>', methods=['DELETE'])
def delete_event_by_id_route(event_id):
    if not event_id:
        return jsonify({"Success": False, "error": "event_id is required"}), 400

    result = delete_event_by_id(event_id)
    if result["Success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@auth_bp.route('/events', methods=['POST'])
def create_event():
    data = request.json
    user_id = data.get('user_id')
    title = data.get('title')
    deadline = data.get('deadline')

    if not user_id or not title or not deadline:
        return jsonify({"error": "Missing required fields"}), 400

    result = add_event(user_id, title, deadline)
    if result["Success"]:
        return jsonify({"message": "Event created successfully"}), 201
    else:
        return jsonify({"error": result["error"]}), 500

@auth_bp.route('/events/<int:user_id>', methods=['GET'])
def fetch_events(user_id):
    result = get_events_by_user(user_id)
    if result["Success"]:
        return jsonify(result["data"]), 200
    else:
        return jsonify({"error": result["error"]}), 500
 
@auth_bp.route('/upload-attachment', methods=['POST'])
def upload_attachment_route():
    file = request.files.get('file')
    user_id = request.form.get('user_id')
    project_id = request.form.get('project_id')
    story_id = request.form.get('story_id')
    print(file)
    print(user_id, project_id, story_id)
    if not file or not user_id or not project_id:
        return jsonify({"error": "Missing file, user_id, or project_id"}), 400

    try:
        filename = secure_filename(file.filename)
        file_type = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        # --- Path Definitions ---
        # 1. Define the primary project-level attachments path
        project_attachments_path = os.path.join(UPLOAD_FOLDER, f"project-{project_id}", "attachments")
        
        # Create the directory if it doesn't exist
        os.makedirs(project_attachments_path, exist_ok=True)
        
        # Define the full path for the file
        project_file_path = os.path.join(project_attachments_path, filename)

        # --- Save the File ---
        # Save the file to the primary project attachments directory
        file.save(project_file_path)
        
        # --- Conditional User Story Save ---
        # If a story_id is provided, also save a copy to the user story folder
        if story_id:
            # 2. Define the user story-specific path
            story_path = os.path.join(UPLOAD_FOLDER, f"project-{project_id}", f"userstory-{story_id}")
            
            # Create the directory if it doesn't exist
            os.makedirs(story_path, exist_ok=True)
            
            # Define the full path for the copy
            story_file_path = os.path.join(story_path, filename)
            
            # Copy the already saved file to the new location
            shutil.copy(project_file_path, story_file_path)

        attachment_id = insert_attachment_to_db(filename, file_type, user_id)

        return jsonify({
            "message": "File uploaded successfully",
            "attachment_id": attachment_id
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/assign-attachments', methods=['POST'])
def assign_attachments():
    data = request.get_json()
    project_id = data.get("project_id")
    attachment_ids = data.get("attachment_ids")
    print(attachment_ids)
    print(project_id)
    print(type(attachment_ids))
    if not project_id or not attachment_ids:
        return jsonify({"error": "project_id and attachment_ids are required"}), 400
    
    # Ensure project_id is an integer
    if isinstance(project_id, dict):
         project_id = project_id.get("message") # Handles specific frontend structure

    # Ensure attachment_ids is a list of integers
    if not isinstance(attachment_ids, list) or not all(isinstance(x, int) for x in attachment_ids):
        return jsonify({"error": "attachment_ids must be a list of integers"}), 400

    try:
        result = call_assign_attachment_procedure(int(project_id), attachment_ids)
        return jsonify(result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/download-attachment', methods=['GET'])
def download_attachment_route():
    project_id = request.args.get('project_id')
    filename = request.args.get('filename')
    UPLOAD_BASE = "/home/bahl/backend/uploads"

    if not project_id or not filename:
        return jsonify({"error": "Missing project_id or filename"}), 400

    file_path = os.path.join(UPLOAD_BASE, f"project-{project_id}","attachments", filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    try:
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@auth_bp.route('/assign-attachment-to-story', methods=['POST'])
def assign_attachment_to_story_route():
    try:
        data = request.json
        attachment_id = data.get('attachment_id')
        project_id = data.get('project_id')
        user_story_id = data.get('user_story_id')
        print(attachment_id,project_id,user_story_id)
        # Validate input
        if not attachment_id or not project_id or not user_story_id:
            return jsonify({'error': 'Missing required fields'}), 400

        # Call the helper function to run the stored procedure
        message = assign_attachment_to_story(
            int(attachment_id),
            int(project_id),
            int(user_story_id)
        )

        return jsonify({'message': message}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    email = data.get('email')
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not email or not current_password or not new_password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    result = change_user_password(email, current_password, new_password)

    if result['success']:
        return jsonify({'success': True, 'message': result['message']}), 200
    else:
        return jsonify({'success': False, 'message': result['message']}), 401

@auth_bp.route("/comment", methods=["POST"])
def create_comment():
    try:
        data = request.json
        story_id = data.get("story_id")
        user_id = data.get("user_id")
        comment_text = data.get("comment_text")

        if not all([story_id, user_id, comment_text]):
            return jsonify({"success": False, "message": "All fields are required"}), 400

        result = insert_comment(story_id, user_id, comment_text)
        if result["success"]:
            return jsonify({"success": True, "message": result["message"]}), 200
        else:
            return jsonify({"success": False, "message": result["message"]}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500    
    

@auth_bp.route('/get_project_summary_alphabetical', methods=['GET'])
def get_project_summary_alphabetical():
    try:
        data = get_all_project_summary_alphabetical()
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500    

@auth_bp.route('/search-projects', methods=['GET'])
def search_projects():
    query = request.args.get('query', '')

    if not query:
        return jsonify({"success": False, "message": "Search query is required"}), 400

    result = search_projects_by_title(query)

    if result["success"]:
        return jsonify({"success": True, "projects": result["projects"]})
    else:
        return jsonify({"success": False, "message": result["message"]}), 500

@auth_bp.route("/search-members", methods=["GET"])
def search_members_route():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"success": False, "message": "Query is required"}), 400

    result = search_members(query)
    return jsonify(result)

@auth_bp.route('/user-story/<int:story_id>/update-status', methods=['POST'])
def update_user_story_status(story_id):
    data = request.get_json()
    new_status_id = data.get('status_id')

    if not new_status_id:
        return {"error": "Missing status_id"}, 400

    try:
        # Update story status
        result = update_story_status_in_db(story_id, new_status_id)
        print(result)
        if result["success"]:
            # Get project_id for this story
            project_id = result.get("project_id")
            print(project_id)
            if not project_id:
                from app.db.db import get_connection    
                conn = get_connection()
                cur = conn.cursor()
                cur.execute("SELECT project_id FROM user_story WHERE story_id = %s", (story_id,))
                row = cur.fetchone()
                project_id = row[0] if row else None
                print(project_id)
                cur.close()
                conn.close()

            if project_id:
                proj_update = update_project_status_based_on_stories(project_id)
            else:
                proj_update = {"success": False, "error": "Project ID not found"}

            return {
                "message": "User story status updated",
                "project_status_updated": proj_update
            }, 200
        else:
            return {"error": result["error"]}, 500

    except Exception as e:
        return {"error": str(e)}, 500

@auth_bp.route('/projects/<int:project_id>/status', methods=['PUT'])
def update_project_status(project_id):
    data = request.get_json()
    status = data.get("status")

    if not status:
        return jsonify({"Success": False, "error": "Missing 'status' in request body"}), 400

    try:
        if status.lower() == "paused":
            result = pause_project(project_id)
        elif status.lower() == "resume":
            result = resume_project_based_on_stories(project_id)
        else:
            return jsonify({"Success": False, "error": "Invalid status value"}), 400

        if result["success"]:
            return jsonify({"Success": True, "message": f"Project status updated to {status}"}), 200
        else:
            return jsonify({"Success": False, "error": result["error"]}), 500

    except Exception as e:
        return jsonify({"Success": False, "error": str(e)}), 500
