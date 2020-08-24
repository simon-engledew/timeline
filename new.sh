#!/usr/bin/env bash

echo $(date -u +'%H:%M:%SZ') $@ >> data/$(date -u +'%Y-%m-%d')
