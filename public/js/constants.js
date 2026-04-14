const programOptions = {
    btech: [
        { value: "b_ai", text: "Artificial Intelligence" },
        { value: "b_ch", text: "Chemical Engineering" },
        { value: "b_ce", text: "Civil Engineering" },
        { value: "b_cse", text: "Computer Science and Engineering" },
        { value: "b_ep", text: "Engineering Physics" },
        { value: "b_ee", text: "Electrical Engineering" },
        { value: "b_ece", text: "Electronics Engineering" },
        { value: "b_vlsi", text: "Electronics & VLSI Engineering" },
        { value: "b_ic", text: "Industrial Chemistry" },
        { value: "b_mnc", text: "Mathematics & Computing" },
        { value: "b_me", text: "Mechanical Engineering" }
    ],

    mtech: [
        { value: "m_cad_cam", text: "CAD - CAM" },
        { value: "m_ch", text: "Chemical Engineering" },
        { value: "m_comm_sys", text: "Communication Systems" },
        { value: "m_cse", text: "Computer Science and Engineering" },
        { value: "m_control_auto", text: "Control & Automation" },
        { value: "m_ctm", text: "Construction Technology and Management" },
        { value: "m_ds", text: "Data Science" },
        { value: "m_env", text: "Environmental Engineering" },
        { value: "m_geo", text: "Geo Technical Engineering" },
        { value: "m_is", text: "Information Security" },
        { value: "m_inst_ctrl", text: "Instrumentation & Control" },
        { value: "m_manufacturing", text: "Manufacturing Engineering" },
        { value: "m_me", text: "Mechanical Engineering" },
        { value: "m_peed", text: "Power Electronics & Electrical Drives" },
        { value: "m_power_sys", text: "Power System" },
        { value: "m_struct", text: "Structural Engineering" },
        { value: "m_thermal", text: "Thermal System Design" },
        { value: "m_transport", text: "Transportation Engineering and Planning" },
        { value: "m_turbo", text: "Turbo Machines" },
        { value: "m_urban", text: "Urban Planning" },
        { value: "m_vlsi", text: "VLSI & Embedded Systems" },
        { value: "m_water", text: "Water Resources Engineering" }
    ],

    msc: [
        { value: "msc_math", text: "Department of Mathematics" },
        { value: "msc_phy", text: "Department of Physics" },
        { value: "msc_chem", text: "Department of Chemistry" }
    ],

    mba: [
        { value: "mba_ba", text: "Business Analytics" }
    ]
};

// Make it available globally
if (typeof window !== 'undefined') {
    window.programOptions = programOptions;
}

// For Node.js CommonJS environment (if we decide to require it in the backend later)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { programOptions };
}
