/*
  # Function: handle_new_user
  [This function automatically creates a user profile in the 'profiles' table when a new user is created in the 'auth.users' table.]

  ## Query Description: [This function is triggered after a new user is inserted into the `auth.users` table. It extracts metadata (like name, city, and type) provided during sign-up and uses it to create a corresponding record in the public `profiles` table. This ensures that every authenticated user has a profile. The function includes fallbacks: if the name is not provided, it defaults to the part of the email before the '@'. This operation is safe and essential for new user registration.]
  
  ## Metadata:
  - Schema-Category: ["Structural"]
  - Impact-Level: ["Low"]
  - Requires-Backup: [false]
  - Reversible: [true]
  
  ## Structure Details:
  - Tables affected: public.profiles (INSERT)
  - Triggered by: auth.users (INSERT)
  
  ## Security Implications:
  - RLS Status: [Not Applicable]
  - Policy Changes: [No]
  - Auth Requirements: [Runs with the permissions of the function definer.]
  
  ## Performance Impact:
  - Indexes: [No change]
  - Triggers: [Adds a trigger to auth.users]
  - Estimated Impact: [Negligible. A single insert operation per new user.]
*/
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, cidade, tipo)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'nome',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'cidade',
      'Não informado'
    ),
    coalesce(
      (new.raw_user_meta_data ->> 'tipo')::public.user_type,
      'cliente'
    )
  );
  return new;
end;
$$;

/*
  # Trigger: on_auth_user_created
  [This trigger executes the 'handle_new_user' function each time a new user is added.]

  ## Query Description: [Creates the trigger on the `auth.users` table that will execute the `handle_new_user` function after each new user insertion. This automates the profile creation process.]
  
  ## Metadata:
  - Schema-Category: ["Structural"]
  - Impact-Level: ["Low"]
  - Requires-Backup: [false]
  - Reversible: [true]
*/
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
