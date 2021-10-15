import { warn, danger } from "danger";

const changelog = danger.git.fileMatch("CHANGELOG.md");

if (!changelog.modified) warn("You haven't updated the changelog!");
