from flask import Blueprint, jsonify
from services.activity import get_recent_activity

activity_bp = Blueprint("activity", __name__)

@activity_bp.route("/recent-activity", methods=["GET"])
def recent_activity():
    data = get_recent_activity()
    return jsonify(data)