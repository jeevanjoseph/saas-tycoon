// --- LOGGING HELPER ---
function addPlayerLog(player, turn, actionOrEvent, details, cashBefore, cashAfter) {
  if (!player.log) player.log = [];
  const cashSpent = Math.max(0, cashBefore - cashAfter);
  player.log.push({
    turn,
    type: actionOrEvent.type ? 'event' : 'action',
    code: actionOrEvent.code || actionOrEvent.type,
    details,
    cashSpent
  });
}

module.exports = {
  addPlayerLog
};