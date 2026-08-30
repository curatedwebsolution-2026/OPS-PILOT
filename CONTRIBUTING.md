# CONTRIBUTING.md - Developer Guide for OPS PILOT

Thank you for contributing to OPS PILOT!

## Code Conventions
1. **Python Backend:** Follow PEP 8 style guidelines. Use Pydantic v2 schemas and type annotations throughout `backend/app/`.
2. **Next.js Frontend:** Follow standard React 18 / Next.js 14 App Router patterns. Keep components modular in `frontend/src/components/`.
3. **Tenant Isolation:** Always scope database queries by `org_id` derived from `current_user.org_id`.
4. **Testing:** Run `PYTHONPATH=. backend/venv/bin/pytest backend/tests/ -v` before pushing any pull requests.
