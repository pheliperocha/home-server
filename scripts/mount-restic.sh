#!/bin/bash

export AWS_PROFILE=pheliperocha
export RESTIC_REPOSITORY=s3:s3.amazonaws.com/home-server-backups

mount_path="/mnt/restic"

if [ ! -d "$mount_path" ]; then
    mkdir -p "$mount_path"
fi

restic mount $mount_path