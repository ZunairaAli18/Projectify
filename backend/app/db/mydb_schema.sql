--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: add_event(integer, character varying, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_event(p_user_id integer, p_title character varying, p_deadline date) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO events (user_id, title, deadline)
    VALUES (p_user_id, p_title, p_deadline);
END;
$$;


ALTER FUNCTION public.add_event(p_user_id integer, p_title character varying, p_deadline date) OWNER TO postgres;

--
-- Name: add_project(text, integer, integer, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_project(p_title text, p_status_id integer, p_created_by integer, p_deadline timestamp without time zone) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_project_id INTEGER;
BEGIN
    INSERT INTO projects (title, status_id, created_by, created_at, deadline)
    VALUES (p_title, p_status_id, p_created_by, NOW(), p_deadline)
    RETURNING project_id INTO new_project_id;

    RETURN new_project_id;
END;
$$;


ALTER FUNCTION public.add_project(p_title text, p_status_id integer, p_created_by integer, p_deadline timestamp without time zone) OWNER TO postgres;

--
-- Name: add_user_story(integer, character varying, text, integer, integer, interval); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_user_story(p_project_id integer, p_title character varying, p_description text, p_status_id integer, p_created_by integer, p_estimated_time interval) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_story_id INT;
BEGIN
    INSERT INTO user_story (
        project_id,
        title,
        description,
        status_id,
        created_by,
        estimated_time
    )
    VALUES (
        p_project_id,
        p_title,
        p_description,
        p_status_id,
        p_created_by,
        p_estimated_time
    )
    RETURNING story_id INTO new_story_id;

    RETURN new_story_id;
END;
$$;


ALTER FUNCTION public.add_user_story(p_project_id integer, p_title character varying, p_description text, p_status_id integer, p_created_by integer, p_estimated_time interval) OWNER TO postgres;

--
-- Name: assign_attachment_to_story(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_attachment_to_story(p_attachment_id integer, p_project_id integer, p_user_story_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- First try to update an existing record
    UPDATE project_attachments
    SET user_story_id = p_user_story_id
    WHERE project_id = p_project_id
      AND attachment_id = p_attachment_id;

    IF FOUND THEN
        RETURN 'Attachment successfully assigned to user story.';
    ELSE
        -- If no record was updated, insert a new one
        INSERT INTO project_attachments (attachment_id, project_id, user_story_id)
        VALUES (p_attachment_id, p_project_id, p_user_story_id);

        RETURN 'No existing record found. New assignment created successfully.';
    END IF;

EXCEPTION
    WHEN unique_violation THEN
        RETURN 'Error: Duplicate assignment attempted. Record already exists.';
    WHEN foreign_key_violation THEN
        RETURN 'Error: The specified attachment_id or user_story_id does not exist. Assignment failed.';
    WHEN OTHERS THEN
        RETURN 'An unexpected error occurred: ' || SQLERRM;
END;
$$;


ALTER FUNCTION public.assign_attachment_to_story(p_attachment_id integer, p_project_id integer, p_user_story_id integer) OWNER TO postgres;

--
-- Name: assign_attachments_to_project(integer, integer[]); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.assign_attachments_to_project(IN p_project_id integer, IN p_attachment_ids integer[])
    LANGUAGE plpgsql
    AS $$
DECLARE
    aid INTEGER;
BEGIN
    FOREACH aid IN ARRAY p_attachment_ids
    LOOP
        -- check if record already exists (with NULL user_story_id allowed)
        IF NOT EXISTS (
            SELECT 1
            FROM project_attachments
            WHERE project_id = p_project_id
              AND attachment_id = aid
              AND user_story_id IS NULL
        ) THEN
            INSERT INTO project_attachments (project_id, attachment_id, user_story_id)
            VALUES (p_project_id, aid, NULL);
        END IF;
    END LOOP;
END;
$$;


ALTER PROCEDURE public.assign_attachments_to_project(IN p_project_id integer, IN p_attachment_ids integer[]) OWNER TO postgres;

--
-- Name: assign_member_to_project(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_member_to_project(p_project_id integer, p_user_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN

    -- Insert assignment
    INSERT INTO user_projects (project_id, user_id)
    VALUES (p_project_id, p_user_id);

    RETURN 'Member assigned successfully';
END;
$$;


ALTER FUNCTION public.assign_member_to_project(p_project_id integer, p_user_id integer) OWNER TO postgres;

--
-- Name: assign_user_to_story(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_user_to_story(p_story_id integer, p_user_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO assignment (story_id, user_id)
    VALUES (p_story_id, p_user_id)
    ON CONFLICT (story_id, user_id) DO NOTHING;

    RETURN 'User assigned successfully';
END;
$$;


ALTER FUNCTION public.assign_user_to_story(p_story_id integer, p_user_id integer) OWNER TO postgres;

--
-- Name: change_user_password(text, text, text); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.change_user_password(IN p_email text, IN p_current_password text, IN p_new_password text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Step 1: Check if current password is correct
  IF EXISTS (
    SELECT 1 FROM users
    WHERE email = p_email
    AND password = crypt(p_current_password, password)
  ) THEN
    -- Step 2: Update to new hashed password
    UPDATE users
    SET password = crypt(p_new_password, gen_salt('bf')),
        modified_at = CURRENT_TIMESTAMP
    WHERE email = p_email;
  ELSE
    -- Step 3: Raise error if current password is invalid
    RAISE EXCEPTION 'Current password is incorrect';
  END IF;
END;
$$;


ALTER PROCEDURE public.change_user_password(IN p_email text, IN p_current_password text, IN p_new_password text) OWNER TO postgres;

--
-- Name: create_user(character varying, character varying, character varying, integer, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_user(p_name character varying, p_email character varying, p_password character varying, p_age integer, p_gender character varying, p_blood_group character varying, p_department_name character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    dept_id INT;
BEGIN
    SELECT department_id INTO dept_id
    FROM departments
    WHERE name = p_department_name;

    IF dept_id IS NULL THEN
        RAISE EXCEPTION 'Department "%" not found', p_department_name;
    END IF;

    INSERT INTO users (
        name, email, password, age, gender, blood_group, department_id
    ) VALUES (
        p_name,
        p_email,
        crypt(p_password, gen_salt('bf')),  -- hashed password
        p_age,
        p_gender,
        p_blood_group,
        dept_id
    );
END;
$$;


ALTER FUNCTION public.create_user(p_name character varying, p_email character varying, p_password character varying, p_age integer, p_gender character varying, p_blood_group character varying, p_department_name character varying) OWNER TO postgres;

--
-- Name: delete_event_by_id(integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.delete_event_by_id(IN p_event_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM events
  WHERE event_id = p_event_id;

  IF NOT FOUND THEN
    RAISE NOTICE 'No event found with ID % for deletion.', p_event_id;
  ELSE
    RAISE NOTICE 'Event % deleted.', p_event_id;
  END IF;
END;
$$;


ALTER PROCEDURE public.delete_event_by_id(IN p_event_id integer) OWNER TO postgres;

--
-- Name: get_all_departments(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_departments() RETURNS TABLE(department_id integer, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.department_id, 
        d.name
    FROM departments d
    ORDER BY d.name;
END;
$$;


ALTER FUNCTION public.get_all_departments() OWNER TO postgres;

--
-- Name: get_all_project_summary(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_project_summary() RETURNS TABLE(project_id integer, title character varying, created_by character varying, created_at timestamp without time zone, status character varying, deadline date)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.project_id,
        p.title,
        u.name AS created_by,
        p.created_at,
        s.type AS status,
        p.deadline
    FROM projects p
    JOIN users u ON p.created_by = u.user_id
    JOIN status s ON p.status_id = s.status_id
    ORDER BY p.created_at DESC; 
END;
$$;


ALTER FUNCTION public.get_all_project_summary() OWNER TO postgres;

--
-- Name: get_all_project_summary_alphabetical(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_project_summary_alphabetical() RETURNS TABLE(project_id integer, title character varying, created_by character varying, created_at timestamp without time zone, status character varying, deadline date)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.project_id,
        p.title,
        u.name AS created_by,
        p.created_at,
        s.type AS status,
        p.deadline
    FROM projects p
    JOIN users u ON p.created_by = u.user_id
    JOIN status s ON p.status_id = s.status_id
    ORDER BY p.title ASC;  -- 🔤 Alphabetically
END;
$$;


ALTER FUNCTION public.get_all_project_summary_alphabetical() OWNER TO postgres;

--
-- Name: get_all_users(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_users() RETURNS TABLE(user_id integer, name character varying, email character varying, role_id integer, age integer, gender character varying, blood_group character varying, joined_at timestamp without time zone, modified_at timestamp without time zone, department_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.name,
        u.email,
        u.role_id,
        u.age,
        u.gender,
        u.blood_group,
        u.joined_at,
        u.modified_at,
        d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.department_id;
END;
$$;


ALTER FUNCTION public.get_all_users() OWNER TO postgres;

--
-- Name: get_assigned_members(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_assigned_members(p_story_id integer) RETURNS TABLE(user_id integer, name character varying, email character varying, age integer, gender character varying, blood_group character varying, department_name character varying, joined_at timestamp without time zone, modified_at timestamp without time zone, role_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.name,
        u.email,
        u.age,
        u.gender,
        u.blood_group,
        d.name AS department_name,
        u.joined_at,
        u.modified_at,
        u.role_id
    FROM assignment a
    JOIN users u ON a.user_id = u.user_id
    LEFT JOIN departments d ON u.department_id = d.department_id
    WHERE a.story_id = p_story_id;
END;
$$;


ALTER FUNCTION public.get_assigned_members(p_story_id integer) OWNER TO postgres;

--
-- Name: get_assigned_projects_by_user_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_assigned_projects_by_user_id(p_user_id integer) RETURNS TABLE(title character varying, deadline date, status_id integer, created_by_name character varying, created_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.title,
        p.deadline,
        p.status_id,
        u.name AS created_by_name,
        p.created_at
    FROM projects p
    JOIN user_projects up ON p.project_id = up.project_id
    JOIN users u ON u.user_id = p.created_by
    WHERE up.user_id = p_user_id
      AND p.active = true;
END;
$$;


ALTER FUNCTION public.get_assigned_projects_by_user_id(p_user_id integer) OWNER TO postgres;

--
-- Name: get_attachments_by_project(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_attachments_by_project(p_project_id integer) RETURNS TABLE(project_id integer, attachment_id integer, name character varying, file_type character varying, created_by_name character varying, created_by integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.project_id,
    a.attachment_id,
    a.filename::varchar AS name,
    a.file_type::varchar AS file_type,
    u.name::varchar AS created_by_name,
    u.user_id AS created_by
  FROM attachments a
  JOIN project_attachments pa ON pa.attachment_id = a.attachment_id
  JOIN users u ON a.created_by = u.user_id
  WHERE pa.project_id = p_project_id;
END;
$$;


ALTER FUNCTION public.get_attachments_by_project(p_project_id integer) OWNER TO postgres;

--
-- Name: get_events_by_user(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_events_by_user(p_user_id integer) RETURNS TABLE(event_id integer, title character varying, deadline date)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT e.event_id, e.title, e.deadline
  FROM events e
  WHERE e.user_id = p_user_id AND e.active = TRUE;
END;
$$;


ALTER FUNCTION public.get_events_by_user(p_user_id integer) OWNER TO postgres;

--
-- Name: get_my_projects_by_email(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_my_projects_by_email(p_email character varying) RETURNS TABLE(project_id integer, title character varying, status_id integer, created_at timestamp without time zone, deadline date, modified_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.project_id,
        p.title,
        p.status_id,
        p.created_at,
        p.deadline,
        p.modified_at
    FROM projects p
    JOIN user_projects up ON p.project_id = up.project_id
    JOIN users u ON up.user_id = u.user_id
    WHERE u.email = p_email

    UNION

    SELECT 
        p.project_id,
        p.title,
        p.status_id,
        p.created_at,
        p.deadline,
        p.modified_at
    FROM projects p
    JOIN users u ON p.created_by = u.user_id
    WHERE u.email = p_email;
END;
$$;


ALTER FUNCTION public.get_my_projects_by_email(p_email character varying) OWNER TO postgres;

--
-- Name: get_project_members(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_project_members(p_project_id integer) RETURNS TABLE(user_id integer, name character varying, email character varying, age integer, gender character varying, blood_group character varying, department_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.age, 
        u.gender, 
        u.blood_group,
        d.name AS department_name
    FROM users u
    JOIN user_projects up ON u.user_id = up.user_id
    LEFT JOIN departments d ON u.department_id = d.department_id
    WHERE up.project_id = p_project_id;
END;
$$;


ALTER FUNCTION public.get_project_members(p_project_id integer) OWNER TO postgres;

--
-- Name: get_projects_created_by_email(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_projects_created_by_email(p_email character varying) RETURNS TABLE(project_id integer, title character varying, status_id integer, created_at timestamp without time zone, deadline date, modified_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.project_id,
        p.title,
        p.status_id,
        p.created_at,
        p.deadline,
        p.modified_at
    FROM projects p
    JOIN users u ON p.created_by = u.user_id
    WHERE u.email = p_email;
END;
$$;


ALTER FUNCTION public.get_projects_created_by_email(p_email character varying) OWNER TO postgres;

--
-- Name: get_user_profile_by_email(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_profile_by_email(p_email character varying) RETURNS TABLE(user_id integer, name character varying, email character varying, age integer, gender character varying, blood_group character varying, joined_at timestamp without time zone, modified_at timestamp without time zone, department_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.name,
        u.email,
        u.age,
        u.gender,
        u.blood_group,
        u.joined_at,
        u.modified_at,
        d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.department_id
    WHERE u.email = p_email;
END;
$$;


ALTER FUNCTION public.get_user_profile_by_email(p_email character varying) OWNER TO postgres;

--
-- Name: get_user_profile_by_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_profile_by_id(p_user_id integer) RETURNS TABLE(user_id integer, name character varying, email character varying, age integer, gender character varying, blood_group character varying, joined_at timestamp without time zone, modified_at timestamp without time zone, department_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.name,
        u.email,
        u.age,
        u.gender,
        u.blood_group,
        u.joined_at,
        u.modified_at,
        d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.department_id
    WHERE u.user_id = p_user_id;
END;
$$;


ALTER FUNCTION public.get_user_profile_by_id(p_user_id integer) OWNER TO postgres;

--
-- Name: get_user_story_details(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_story_details(p_story_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'story', (
            SELECT row_to_json(s)
            FROM (
                SELECT 
                    us.story_id,
                    us.title,
                    us.description,
                    st.status_id,
                    st.type AS status_type,
                    us.created_at,
                    us.modified_at,
                    us.estimated_time,
                    u.user_id,
                    u.name AS created_by,
                    u.email AS creator_email
                FROM user_story us
                JOIN users u ON us.created_by = u.user_id
                JOIN status st ON st.status_id = us.status_id
                WHERE us.story_id = p_story_id
            ) s
        ),
        'comments', (
            SELECT json_agg(row_to_json(c))
            FROM (
                SELECT 
                    c.comment_id, 
                    c.comment_text, 
                    c.comment_time, 
                    u.name AS commented_by, 
                    u.email AS commenter_email
                FROM comment c
                JOIN users u ON c.user_id = u.user_id
                WHERE c.story_id = p_story_id
            ) c
        ),
        'attachments', (
            -- MODIFIED SECTION: This subquery now correctly joins through the
            -- project_attachments table to find attachments linked to the user story.
            SELECT json_agg(row_to_json(att))
            FROM (
                SELECT 
                    a.attachment_id, 
                    a.filename, 
                    a.file_type,
                    a.created_at AS uploaded_at, -- Assuming 'created_at' is the upload timestamp in the attachments table
                    u.name AS uploaded_by,
                    u.user_id AS uploaded_by_id
                FROM project_attachments pa
                -- Join to get the attachment details (filename, type, etc.)
                JOIN attachments a ON pa.attachment_id = a.attachment_id
                -- Join to get the name of the user who created the attachment
                JOIN users u ON a.created_by = u.user_id
                -- Filter for the specific user story ID
                WHERE pa.user_story_id = p_story_id
            ) att
        ),
        'time_tracking', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT 
                    t.time_id, 
                    t.log_date, 
                    t.hours_logged, 
                    u.name AS logged_by,
                    u.email AS logger_email
                FROM time_tracking t
                JOIN users u ON t.user_id = u.user_id
                WHERE t.story_id = p_story_id
            ) t
        )
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION public.get_user_story_details(p_story_id integer) OWNER TO postgres;

--
-- Name: get_users_not_assigned_to_project(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_users_not_assigned_to_project(p_project_id integer) RETURNS TABLE(user_id integer, name character varying, email character varying, age integer, gender character varying, blood_group character varying, joined_at timestamp without time zone, modified_at timestamp without time zone, department_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.name,
        u.email,
        u.age,
        u.gender,
        u.blood_group,
        u.joined_at,
        u.modified_at,
        d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.department_id
    WHERE u.user_id NOT IN (
        SELECT up.user_id
        FROM user_projects up
        WHERE up.project_id = p_project_id
    );
END;
$$;


ALTER FUNCTION public.get_users_not_assigned_to_project(p_project_id integer) OWNER TO postgres;

--
-- Name: get_users_not_assigned_to_story(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_users_not_assigned_to_story(p_story_id integer) RETURNS TABLE(user_id integer, name character varying, email character varying, age integer, gender character varying, blood_group character varying, joined_at timestamp without time zone, modified_at timestamp without time zone, department_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.name,
        u.email,
        u.age,
        u.gender,
        u.blood_group,
        u.joined_at,
        u.modified_at,
        d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.department_id
    WHERE u.user_id NOT IN (
        SELECT a.user_id
        FROM assignment a
        WHERE a.story_id = p_story_id
    );
END;
$$;


ALTER FUNCTION public.get_users_not_assigned_to_story(p_story_id integer) OWNER TO postgres;

--
-- Name: get_users_not_in_user_projects(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_users_not_in_user_projects() RETURNS TABLE(user_id integer, name character varying, email character varying, age integer, gender character varying, blood_group character varying, joined_at timestamp without time zone, modified_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.name,
        u.email,
        u.age,
        u.gender,
        u.blood_group,
        u.joined_at,
        u.modified_at
    FROM users u
    LEFT JOIN user_projects up ON u.user_id = up.user_id
    WHERE up.project_id IS NULL;
END;
$$;


ALTER FUNCTION public.get_users_not_in_user_projects() OWNER TO postgres;

--
-- Name: insert_comment(integer, integer, text); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.insert_comment(IN p_story_id integer, IN p_user_id integer, IN p_comment_text text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO public."comment" (story_id, user_id, comment_text)
    VALUES (p_story_id, p_user_id, p_comment_text);
END;
$$;


ALTER PROCEDURE public.insert_comment(IN p_story_id integer, IN p_user_id integer, IN p_comment_text text) OWNER TO postgres;

--
-- Name: search_members(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.search_members(query text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN (
    SELECT json_agg(u)
    FROM (
      SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.age, 
        u.gender, 
        u.blood_group, 
        d.name AS department, 
        u.joined_at, 
        u.modified_at 
      FROM users u
      JOIN departments d ON u.department_id = d.department_id
      WHERE LOWER(u.name) LIKE '%' || LOWER(query) || '%'
    ) u
  );
END;
$$;


ALTER FUNCTION public.search_members(query text) OWNER TO postgres;

--
-- Name: search_projects_by_title(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.search_projects_by_title(p_query text) RETURNS TABLE(project_id integer, title character varying, created_by character varying, created_at timestamp without time zone, status character varying, deadline date)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.project_id,
        p.title,
        u.name AS created_by,
        p.created_at,
        s.type AS status,
        p.deadline
    FROM projects p
    JOIN users u ON p.created_by = u.user_id
    JOIN status s ON p.status_id = s.status_id
    WHERE LOWER(p.title) LIKE '%' || LOWER(p_query) || '%';
END;
$$;


ALTER FUNCTION public.search_projects_by_title(p_query text) OWNER TO postgres;

--
-- Name: sp_get_attachments_by_project(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_attachments_by_project(p_project_id integer) RETURNS TABLE(attachment_id integer, file_name character varying, path text, uploaded_by integer, uploaded_at timestamp without time zone, story_id integer, project_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.attachment_id,
        a.file_name,
        a.path,
        a.uploaded_by,
        a.uploaded_at,
        a.story_id,
        a.project_id
    FROM 
        attachment a
    WHERE 
        a.project_id = p_project_id;
END;
$$;


ALTER FUNCTION public.sp_get_attachments_by_project(p_project_id integer) OWNER TO postgres;

--
-- Name: sp_get_user_stories_by_project(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_user_stories_by_project(p_project_id integer) RETURNS TABLE(story_id integer, title character varying, description text, estimated_time interval, created_at timestamp without time zone, modified_at timestamp without time zone, status_id integer, type character varying, created_by integer, project_id integer, project_title character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.story_id,
    us.title,
    us.description,
    us.estimated_time,
    us.created_at,
    us.modified_at,
    us.status_id,
    s.type,
    us.created_by,
    us.project_id,
    p.title AS project_title
  FROM 
    user_story us
    LEFT JOIN status s ON us.status_id = s.status_id
    LEFT JOIN projects p ON us.project_id = p.project_id
  WHERE 
    us.project_id = p_project_id;
END;
$$;


ALTER FUNCTION public.sp_get_user_stories_by_project(p_project_id integer) OWNER TO postgres;

--
-- Name: sp_update_user_story_status(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_update_user_story_status(p_story_id integer, p_status_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE user_story
  SET status_id = p_status_id,
      modified_at = CURRENT_TIMESTAMP
  WHERE story_id = p_story_id;
END;
$$;


ALTER FUNCTION public.sp_update_user_story_status(p_story_id integer, p_status_id integer) OWNER TO postgres;

--
-- Name: update_active_flag(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_active_flag() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.active := NEW.deadline > CURRENT_DATE;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_active_flag() OWNER TO postgres;

--
-- Name: update_event_active_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_event_active_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Set active to TRUE if deadline is today or later
  IF NEW.deadline >= CURRENT_DATE THEN
    NEW.active := TRUE;
  ELSE
    NEW.active := FALSE;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_event_active_status() OWNER TO postgres;

--
-- Name: update_event_deadline(integer, date); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.update_event_deadline(IN p_event_id integer, IN p_new_deadline date)
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE events
  SET deadline = p_new_deadline
  WHERE event_id = p_event_id;

  IF NOT FOUND THEN
    RAISE NOTICE 'No event found with ID % for update.', p_event_id;
  ELSE
    RAISE NOTICE 'Event % deadline updated to %.', p_event_id, p_new_deadline;
  END IF;
END;
$$;


ALTER PROCEDURE public.update_event_deadline(IN p_event_id integer, IN p_new_deadline date) OWNER TO postgres;

--
-- Name: update_project_with_versioning(integer, character varying, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_project_with_versioning(p_project_id integer, p_new_title character varying, p_new_deadline date) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_project RECORD;
BEGIN
    -- Step 1: Fetch the current project details
    SELECT * INTO old_project
    FROM projects
    WHERE project_id = p_project_id;

    IF NOT FOUND THEN
        RETURN 'Project not found';
    END IF;

    -- Step 2: Archive the old version into the history table
    INSERT INTO projects_history (
        project_id,
        title,
        status_id,
        created_by,
        created_at,
        deadline,
        modified_at
    )
    VALUES (
        old_project.project_id,
        old_project.title,
        old_project.status_id,
        old_project.created_by,
        old_project.created_at,
        old_project.deadline,
        old_project.modified_at
    );

    -- Step 3: Update the original project record
    UPDATE projects
    SET title = p_new_title,
        deadline = p_new_deadline,
        modified_at = CURRENT_TIMESTAMP
    WHERE project_id = p_project_id;

    RETURN 'Project updated and version archived successfully';
END;
$$;


ALTER FUNCTION public.update_project_with_versioning(p_project_id integer, p_new_title character varying, p_new_deadline date) OWNER TO postgres;

--
-- Name: update_user_story_with_history(integer, character varying, text, integer, interval); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_story_with_history(p_story_id integer, p_title character varying, p_description text, p_status_id integer, p_estimated_time interval) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_story user_story%ROWTYPE;
BEGIN
    -- 1. Store current record in variable
    SELECT * INTO v_story FROM user_story WHERE story_id = p_story_id;

    -- 2. Archive old record to history
    INSERT INTO user_story_history (
        story_id, project_id, title, description, status_id,
        created_by, created_at, estimated_time, modified_at
    )
    VALUES (
        v_story.story_id, v_story.project_id, v_story.title, v_story.description,
        v_story.status_id, v_story.created_by, v_story.created_at,
        v_story.estimated_time, CURRENT_TIMESTAMP
    );

    -- 3. Update existing record
    UPDATE user_story
    SET
        title = p_title,
        description = p_description,
        status_id = p_status_id,
        estimated_time = p_estimated_time,
        modified_at = CURRENT_TIMESTAMP
    WHERE story_id = p_story_id;

    RETURN 'User story updated with history recorded';
END;
$$;


ALTER FUNCTION public.update_user_story_with_history(p_story_id integer, p_title character varying, p_description text, p_status_id integer, p_estimated_time interval) OWNER TO postgres;

--
-- Name: update_user_with_history(integer, text, text, integer, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_with_history(p_user_id integer, p_name text, p_email text, p_age integer, p_gender text, p_blood_group text, p_department_name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_department_id INT;
BEGIN
  -- Step 1: Get department_id from department_name
  SELECT department_id INTO v_department_id
  FROM departments
  WHERE name = p_department_name;

  -- If department not found, raise error
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Department "%" not found.', p_department_name;
  END IF;

  -- Step 2: Insert or update history
  IF EXISTS (SELECT 1 FROM user_history WHERE user_id = p_user_id) THEN
    -- Update history
    UPDATE user_history
    SET
      name = u.name,
      email = u.email,
      role_id = u.role_id,
      password = u.password,
      age = u.age,
      gender = u.gender,
      blood_group = u.blood_group,
      joined_at = u.joined_at,
      modified_at = CURRENT_TIMESTAMP,
      department_id = u.department_id
    FROM users u
    WHERE user_history.user_id = p_user_id AND u.user_id = p_user_id;
  ELSE
    -- Insert history
    INSERT INTO user_history (
      user_id, name, email, role_id, password, age, gender,
      blood_group, joined_at, modified_at, department_id
    )
    SELECT
      user_id, name, email, role_id, password, age, gender,
      blood_group, joined_at, modified_at, department_id
    FROM users
    WHERE user_id = p_user_id;
  END IF;

  -- Step 3: Update users table
  UPDATE users
  SET
    name = p_name,
    email = p_email,
    age = p_age,
    gender = p_gender,
    blood_group = p_blood_group,
    department_id = v_department_id,
    modified_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;

  RETURN 'User updated successfully.';
END;
$$;


ALTER FUNCTION public.update_user_with_history(p_user_id integer, p_name text, p_email text, p_age integer, p_gender text, p_blood_group text, p_department_name text) OWNER TO postgres;

--
-- Name: update_user_with_history(integer, character varying, character varying, integer, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_with_history(p_user_id integer, p_name character varying, p_email character varying, p_age integer, p_gender character varying, p_blood_group character varying, p_department_name character varying) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_department_id INT;
BEGIN
  -- Step 1: Get department_id from department_name
  SELECT department_id INTO v_department_id
  FROM departments
  WHERE name = p_department_name;

  -- If department not found, raise error
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Department "%" not found.', p_department_name;
  END IF;

  -- Step 2: Insert or update history
  IF EXISTS (SELECT 1 FROM user_history WHERE user_id = p_user_id) THEN
    -- Update history
    UPDATE user_history
    SET
      name = u.name,
      email = u.email,
      role_id = u.role_id,
      password = u.password,
      age = u.age,
      gender = u.gender,
      blood_group = u.blood_group,
      joined_at = u.joined_at,
      modified_at = CURRENT_TIMESTAMP,
      department_id = u.department_id
    FROM users u
    WHERE user_history.user_id = p_user_id AND u.user_id = p_user_id;
  ELSE
    -- Insert history
    INSERT INTO user_history (
      user_id, name, email, role_id, password, age, gender,
      blood_group, joined_at, modified_at, department_id
    )
    SELECT
      user_id, name, email, role_id, password, age, gender,
      blood_group, joined_at, modified_at, department_id
    FROM users
    WHERE user_id = p_user_id;
  END IF;

  -- Step 3: Update users table
  UPDATE users
  SET
    name = p_name,
    
    age = p_age,
    gender = p_gender,
    blood_group = p_blood_group,
    department_id = v_department_id,
    modified_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;

  RETURN 'User updated successfully.';
END;
$$;


ALTER FUNCTION public.update_user_with_history(p_user_id integer, p_name character varying, p_email character varying, p_age integer, p_gender character varying, p_blood_group character varying, p_department_name character varying) OWNER TO postgres;

--
-- Name: upload_attachment_record(text, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.upload_attachment_record(p_name text, p_file_type text, p_created_by integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    existing_id INTEGER;
BEGIN
    -- Check for existing attachment
    SELECT attachment_id
    INTO existing_id
    FROM attachments
    WHERE filename = p_name AND created_by = p_created_by
    LIMIT 1;

    -- If it exists, return it
    IF existing_id IS NOT NULL THEN
        RETURN existing_id;
    END IF;

    -- Otherwise, insert new and return new id
    INSERT INTO attachments(filename, file_type, created_by)
    VALUES (p_name, p_file_type, p_created_by)
    RETURNING attachment_id INTO existing_id;

    RETURN existing_id;
END;
$$;


ALTER FUNCTION public.upload_attachment_record(p_name text, p_file_type text, p_created_by integer) OWNER TO postgres;

--
-- Name: verify_user_credentials(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.verify_user_credentials(p_email text, p_password text) RETURNS TABLE(user_id integer, name character varying, email character varying, role_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT u.user_id, u.name, u.email, u.role_id
    FROM users u
    WHERE u.email = p_email
    AND u.password = crypt(p_password, u.password);
END;
$$;


ALTER FUNCTION public.verify_user_credentials(p_email text, p_password text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment (
    assignment_id integer NOT NULL,
    story_id integer,
    user_id integer,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assignment OWNER TO postgres;

--
-- Name: assignment_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.assignment ALTER COLUMN assignment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assignment_assignment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    attachment_id integer NOT NULL,
    filename text NOT NULL,
    file_type text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- Name: attachments_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attachments_attachment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attachments_attachment_id_seq OWNER TO postgres;

--
-- Name: attachments_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attachments_attachment_id_seq OWNED BY public.attachments.attachment_id;


--
-- Name: comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment (
    comment_id integer NOT NULL,
    story_id integer,
    user_id integer,
    comment_text text NOT NULL,
    comment_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comment OWNER TO postgres;

--
-- Name: comment_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.comment ALTER COLUMN comment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.comment_comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    deadline date NOT NULL,
    active boolean DEFAULT true
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_event_id_seq OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.permissions ALTER COLUMN permission_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.permissions_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: project_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_attachments (
    id integer NOT NULL,
    project_id integer NOT NULL,
    attachment_id integer NOT NULL,
    user_story_id integer
);


ALTER TABLE public.project_attachments OWNER TO postgres;

--
-- Name: project_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_attachments_id_seq OWNER TO postgres;

--
-- Name: project_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_attachments_id_seq OWNED BY public.project_attachments.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    title character varying(100) NOT NULL,
    status_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deadline date,
    modified_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    active boolean
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects_history (
    projects_history_id integer NOT NULL,
    project_id integer,
    title character varying(100),
    status_id integer,
    created_by integer,
    created_at timestamp without time zone,
    deadline date,
    modified_at timestamp without time zone
);


ALTER TABLE public.projects_history OWNER TO postgres;

--
-- Name: projects_history_projects_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_history_projects_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_history_projects_history_id_seq OWNER TO postgres;

--
-- Name: projects_history_projects_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_history_projects_history_id_seq OWNED BY public.projects_history.projects_history_id;


--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.projects ALTER COLUMN project_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.projects_project_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN role_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.status (
    status_id integer NOT NULL,
    type character varying(100) NOT NULL
);


ALTER TABLE public.status OWNER TO postgres;

--
-- Name: status_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.status ALTER COLUMN status_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.status_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: time_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_tracking (
    time_id integer NOT NULL,
    story_id integer,
    user_id integer,
    log_date date DEFAULT CURRENT_DATE,
    hours_logged interval
);


ALTER TABLE public.time_tracking OWNER TO postgres;

--
-- Name: time_tracking_time_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.time_tracking ALTER COLUMN time_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.time_tracking_time_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_history (
    history_id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(100),
    email character varying(100),
    role_id integer,
    password character varying(100),
    age integer,
    gender character varying(10),
    blood_group character varying(5),
    joined_at timestamp without time zone,
    modified_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    department_id integer,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_history OWNER TO postgres;

--
-- Name: user_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_history_history_id_seq OWNER TO postgres;

--
-- Name: user_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_history_history_id_seq OWNED BY public.user_history.history_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    role_id integer,
    password character varying(100) NOT NULL,
    age integer,
    gender character varying(10),
    blood_group character varying(5),
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    department_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public.users.user_id;


--
-- Name: user_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_projects (
    user_id integer NOT NULL,
    project_id integer NOT NULL
);


ALTER TABLE public.user_projects OWNER TO postgres;

--
-- Name: user_story; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_story (
    story_id integer NOT NULL,
    project_id integer,
    title character varying(255) NOT NULL,
    description text,
    status_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estimated_time interval,
    modified_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_story OWNER TO postgres;

--
-- Name: user_story_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_story_history (
    history_id integer NOT NULL,
    story_id integer,
    project_id integer,
    title character varying(255),
    description text,
    status_id integer,
    created_by integer,
    created_at timestamp without time zone,
    estimated_time interval,
    archived_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_story_history OWNER TO postgres;

--
-- Name: user_story_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_story_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_story_history_history_id_seq OWNER TO postgres;

--
-- Name: user_story_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_story_history_history_id_seq OWNED BY public.user_story_history.history_id;


--
-- Name: user_story_story_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_story ALTER COLUMN story_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_story_story_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: attachments attachment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments ALTER COLUMN attachment_id SET DEFAULT nextval('public.attachments_attachment_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);


--
-- Name: project_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments ALTER COLUMN id SET DEFAULT nextval('public.project_attachments_id_seq'::regclass);


--
-- Name: projects_history projects_history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects_history ALTER COLUMN projects_history_id SET DEFAULT nextval('public.projects_history_projects_history_id_seq'::regclass);


--
-- Name: user_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_history ALTER COLUMN history_id SET DEFAULT nextval('public.user_history_history_id_seq'::regclass);


--
-- Name: user_story_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_story_history ALTER COLUMN history_id SET DEFAULT nextval('public.user_story_history_history_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: assignment assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_pkey PRIMARY KEY (assignment_id);


--
-- Name: assignment assignment_story_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_story_id_user_id_key UNIQUE (story_id, user_id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (attachment_id);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (comment_id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: project_attachments project_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_pkey PRIMARY KEY (id);


--
-- Name: projects_history projects_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects_history
    ADD CONSTRAINT projects_history_pkey PRIMARY KEY (projects_history_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: status status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (status_id);


--
-- Name: time_tracking time_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_tracking
    ADD CONSTRAINT time_tracking_pkey PRIMARY KEY (time_id);


--
-- Name: attachments unique_attachment_per_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT unique_attachment_per_user UNIQUE (filename, created_by);


--
-- Name: user_history user_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_history
    ADD CONSTRAINT user_history_pkey PRIMARY KEY (history_id);


--
-- Name: user_projects user_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_pkey PRIMARY KEY (user_id, project_id);


--
-- Name: user_story_history user_story_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_story_history
    ADD CONSTRAINT user_story_history_pkey PRIMARY KEY (history_id);


--
-- Name: user_story user_story_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_story
    ADD CONSTRAINT user_story_pkey PRIMARY KEY (story_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: projects trigger_update_active; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_active BEFORE INSERT OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_active_flag();


--
-- Name: events trigger_update_event_active; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_event_active BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_event_active_status();


--
-- Name: assignment assignment_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.user_story(story_id) ON DELETE CASCADE;


--
-- Name: assignment assignment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: comment comment_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.user_story(story_id) ON DELETE CASCADE;


--
-- Name: comment comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: project_attachments fk_project_attachments_user_story; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT fk_project_attachments_user_story FOREIGN KEY (user_story_id) REFERENCES public.user_story(story_id) ON DELETE SET NULL;


--
-- Name: events fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: project_attachments project_attachments_attachment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES public.attachments(attachment_id) ON DELETE CASCADE;


--
-- Name: project_attachments project_attachments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: projects projects_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.status(status_id);


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- Name: time_tracking time_tracking_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_tracking
    ADD CONSTRAINT time_tracking_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.user_story(story_id) ON DELETE CASCADE;


--
-- Name: time_tracking time_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_tracking
    ADD CONSTRAINT time_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_history user_history_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_history
    ADD CONSTRAINT user_history_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_projects user_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: user_projects user_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_story user_story_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_story
    ADD CONSTRAINT user_story_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: user_story user_story_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_story
    ADD CONSTRAINT user_story_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: user_story user_story_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_story
    ADD CONSTRAINT user_story_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.status(status_id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- PostgreSQL database dump complete
--

